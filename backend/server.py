from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import requests as http_requests
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import Optional, List
import io

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

# Object Storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "clarity-coaching"
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Password helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

# JWT helpers
def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

# Auth dependency
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Account deactivated")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str

class CreateParticipantRequest(BaseModel):
    name: str
    email: str
    password: str

class UpdateSessionRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None

class ScheduleRequestCreate(BaseModel):
    requested_date: str
    requested_time: str
    notes: Optional[str] = ""

class ScheduleRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = ""
    adjusted_date: Optional[str] = None
    adjusted_time: Optional[str] = None

class PostCreate(BaseModel):
    content: str
    type: str  # best_practice or quote

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class AdminResetPasswordRequest(BaseModel):
    new_password: str

# App + Router
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ AUTH ROUTES ============

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        last = attempt.get("last_attempt")
        if last and (datetime.now(timezone.utc) - datetime.fromisoformat(last)) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if account is active
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account has been deactivated. Contact your administrator.")
    
    await db.login_attempts.delete_one({"identifier": identifier})
    
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    
    return {
        "id": uid,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "force_password_change": user.get("force_password_change", False)
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    # Also fetch force_password_change from DB
    db_user = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"force_password_change": 1})
    user["force_password_change"] = db_user.get("force_password_change", False) if db_user else False
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ============ PARTICIPANT MANAGEMENT (ADMIN) ============

@api_router.post("/auth/change-password")
async def change_password(req: ChangePasswordRequest, request: Request):
    user = await get_current_user(request)
    
    # Verify current password
    db_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if not db_user or not verify_password(req.current_password, db_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"password_hash": hash_password(req.new_password), "force_password_change": False}}
    )
    return {"message": "Password changed successfully"}

@api_router.post("/participants/{participant_id}/reset-password")
async def admin_reset_password(participant_id: str, req: AdminResetPasswordRequest, request: Request):
    await require_admin(request)
    
    participant = await db.users.find_one({"_id": ObjectId(participant_id), "role": "participant"})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    await db.users.update_one(
        {"_id": ObjectId(participant_id)},
        {"$set": {"password_hash": hash_password(req.new_password), "force_password_change": True}}
    )
    return {"message": "Password reset successfully"}

@api_router.put("/participants/{participant_id}/deactivate")
async def deactivate_participant(participant_id: str, request: Request):
    await require_admin(request)
    
    participant = await db.users.find_one({"_id": ObjectId(participant_id), "role": "participant"})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    await db.users.update_one(
        {"_id": ObjectId(participant_id)},
        {"$set": {"is_active": not participant.get("is_active", True)}}
    )
    new_status = not participant.get("is_active", True)
    return {"message": f"Participant {'activated' if new_status else 'deactivated'}", "is_active": new_status}

@api_router.delete("/participants/{participant_id}")
async def archive_participant(participant_id: str, request: Request):
    await require_admin(request)
    
    participant = await db.users.find_one({"_id": ObjectId(participant_id), "role": "participant"})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Soft-delete: mark as archived and deactivated
    await db.users.update_one(
        {"_id": ObjectId(participant_id)},
        {"$set": {"is_active": False, "archived": True, "archived_at": datetime.now(timezone.utc).isoformat()}}
    )
    # Soft-delete associated resources
    await db.resources.update_many(
        {"participant_id": participant_id},
        {"$set": {"is_deleted": True}}
    )
    return {"message": "Participant archived"}

@api_router.post("/participants")
async def create_participant(req: CreateParticipantRequest, request: Request):
    admin = await require_admin(request)
    email = req.email.lower().strip()
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user_doc = {
        "email": email,
        "name": req.name,
        "password_hash": hash_password(req.password),
        "role": "participant",
        "is_active": True,
        "force_password_change": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    uid = str(result.inserted_id)
    
    # Initialize 10 sessions for this participant
    sessions = []
    for i in range(1, 11):
        sessions.append({
            "id": str(uuid.uuid4()),
            "participant_id": uid,
            "session_number": i,
            "status": "upcoming",
            "notes": "",
            "scheduled_date": "",
            "completed_at": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    if sessions:
        await db.sessions.insert_many(sessions)
    
    return {"id": uid, "email": email, "name": req.name, "role": "participant"}

@api_router.get("/participants")
async def list_participants(request: Request):
    await require_admin(request)
    participants = await db.users.find(
        {"role": "participant", "archived": {"$ne": True}},
        {"_id": 1, "email": 1, "name": 1, "role": 1, "created_at": 1, "is_active": 1}
    ).to_list(1000)
    result = []
    for p in participants:
        p["id"] = str(p["_id"])
        del p["_id"]
        # Count completed sessions
        completed = await db.sessions.count_documents({"participant_id": p["id"], "status": "completed"})
        total = await db.sessions.count_documents({"participant_id": p["id"]})
        p["sessions_completed"] = completed
        p["sessions_total"] = total
        p["is_active"] = p.get("is_active", True)
        result.append(p)
    return result

@api_router.get("/participants/{participant_id}")
async def get_participant(participant_id: str, request: Request):
    user = await get_current_user(request)
    # Participants can only see their own data, admins can see all
    if user["role"] == "participant" and user["_id"] != participant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    p = await db.users.find_one({"_id": ObjectId(participant_id)}, {"password_hash": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    p["id"] = str(p["_id"])
    del p["_id"]
    return p

# ============ SESSION TRACKING ============

@api_router.get("/sessions/{participant_id}")
async def get_sessions(participant_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] == "participant" and user["_id"] != participant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    sessions = await db.sessions.find({"participant_id": participant_id}, {"_id": 0}).sort("session_number", 1).to_list(20)
    return sessions

@api_router.put("/sessions/{session_id}")
async def update_session(session_id: str, req: UpdateSessionRequest, request: Request):
    admin = await require_admin(request)
    
    update = {}
    if req.status is not None:
        update["status"] = req.status
        if req.status == "completed":
            update["completed_at"] = datetime.now(timezone.utc).isoformat()
    if req.notes is not None:
        update["notes"] = req.notes
    if req.scheduled_date is not None:
        update["scheduled_date"] = req.scheduled_date
    
    result = await db.sessions.update_one({"id": session_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session updated"}

# ============ RESOURCE HUB ============

RESOURCE_TYPES = ["resource_guide", "360_assessment", "16personalities", "midway_report", "graduation_report", "certificate"]

@api_router.post("/resources/upload")
async def upload_resource(
    request: Request,
    participant_id: str = Form(...),
    resource_type: str = Form(...),
    file: UploadFile = File(...)
):
    admin = await require_admin(request)
    
    if resource_type not in RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid resource type. Must be one of: {RESOURCE_TYPES}")
    
    # Check participant exists
    participant = await db.users.find_one({"_id": ObjectId(participant_id), "role": "participant"})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    data = await file.read()
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    storage_path = f"{APP_NAME}/resources/{participant_id}/{resource_type}/{uuid.uuid4()}.{ext}"
    
    # Upload to storage
    result = put_object(storage_path, data, file.content_type or "application/octet-stream")
    
    # Soft-delete previous version of same type
    await db.resources.update_many(
        {"participant_id": participant_id, "type": resource_type, "is_deleted": False},
        {"$set": {"is_deleted": True}}
    )
    
    # Store reference
    doc = {
        "id": str(uuid.uuid4()),
        "participant_id": participant_id,
        "type": resource_type,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type or "application/octet-stream",
        "size": result.get("size", len(data)),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": admin["_id"],
        "is_deleted": False
    }
    await db.resources.insert_one(doc)
    
    return {"id": doc["id"], "filename": file.filename, "type": resource_type, "path": result["path"]}

@api_router.get("/resources/{participant_id}")
async def get_resources(participant_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] == "participant" and user["_id"] != participant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resources = await db.resources.find(
        {"participant_id": participant_id, "is_deleted": False}, {"_id": 0}
    ).to_list(100)
    return resources

@api_router.get("/resources/download/{resource_id}")
async def download_resource(resource_id: str, request: Request):
    user = await get_current_user(request)
    
    resource = await db.resources.find_one({"id": resource_id, "is_deleted": False}, {"_id": 0})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Participant can only download their own
    if user["role"] == "participant" and user["_id"] != resource["participant_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data, ct = get_object(resource["storage_path"])
    
    return Response(
        content=data,
        media_type=resource.get("content_type", ct),
        headers={"Content-Disposition": f'attachment; filename="{resource["original_filename"]}"'}
    )

@api_router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: str, request: Request):
    admin = await require_admin(request)
    result = await db.resources.update_one({"id": resource_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted"}

# ============ SCHEDULING ============

@api_router.post("/schedule/request")
async def create_schedule_request(req: ScheduleRequestCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "participant":
        raise HTTPException(status_code=400, detail="Only participants can request sessions")
    
    doc = {
        "id": str(uuid.uuid4()),
        "participant_id": user["_id"],
        "participant_name": user["name"],
        "requested_date": req.requested_date,
        "requested_time": req.requested_time,
        "notes": req.notes or "",
        "status": "pending",
        "admin_notes": "",
        "adjusted_date": "",
        "adjusted_time": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.schedule_requests.insert_one(doc)
    return {"id": doc["id"], "status": "pending", "message": "Session request submitted"}

@api_router.get("/schedule/all")
async def get_all_schedule_requests(request: Request):
    admin = await require_admin(request)
    requests_list = await db.schedule_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return requests_list

@api_router.get("/schedule/{participant_id}")
async def get_schedule(participant_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] == "participant" and user["_id"] != participant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    requests_list = await db.schedule_requests.find(
        {"participant_id": participant_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return requests_list

@api_router.put("/schedule/{request_id}")
async def update_schedule_request(request_id: str, req: ScheduleRequestUpdate, request: Request):
    admin = await require_admin(request)
    
    update = {
        "status": req.status,
        "admin_notes": req.admin_notes or "",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if req.adjusted_date:
        update["adjusted_date"] = req.adjusted_date
    if req.adjusted_time:
        update["adjusted_time"] = req.adjusted_time
    
    result = await db.schedule_requests.update_one({"id": request_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Schedule request not found")
    return {"message": "Schedule request updated"}

# ============ COMMUNITY FEED ============

@api_router.post("/feed")
async def create_post(req: PostCreate, request: Request):
    user = await get_current_user(request)
    
    if req.type not in ["best_practice", "quote"]:
        raise HTTPException(status_code=400, detail="Post type must be 'best_practice' or 'quote'")
    
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "user_name": user["name"],
        "user_role": user["role"],
        "content": req.content,
        "type": req.type,
        "likes": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.posts.insert_one(doc)
    return {"id": doc["id"], "message": "Post created"}

@api_router.get("/feed")
async def get_feed(request: Request):
    user = await get_current_user(request)
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.post("/feed/{post_id}/like")
async def toggle_like(post_id: str, request: Request):
    user = await get_current_user(request)
    uid = user["_id"]
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    if uid in likes:
        likes.remove(uid)
    else:
        likes.append(uid)
    
    await db.posts.update_one({"id": post_id}, {"$set": {"likes": likes}})
    return {"likes_count": len(likes), "liked": uid in likes}

# ============ DASHBOARD STATS ============

@api_router.get("/dashboard/participant")
async def participant_dashboard(request: Request):
    user = await get_current_user(request)
    uid = user["_id"]
    
    sessions = await db.sessions.find({"participant_id": uid}, {"_id": 0}).sort("session_number", 1).to_list(10)
    completed = sum(1 for s in sessions if s["status"] == "completed")
    
    # Find next upcoming session
    next_session = None
    for s in sessions:
        if s["status"] != "completed":
            next_session = s
            break
    
    resources = await db.resources.find({"participant_id": uid, "is_deleted": False}, {"_id": 0}).to_list(50)
    
    schedule_requests = await db.schedule_requests.find(
        {"participant_id": uid}, {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    
    return {
        "user": user,
        "sessions": sessions,
        "completed_sessions": completed,
        "total_sessions": len(sessions),
        "progress_percent": int((completed / max(len(sessions), 1)) * 100),
        "next_session": next_session,
        "resources": resources,
        "schedule_requests": schedule_requests
    }

@api_router.get("/dashboard/admin")
async def admin_dashboard(request: Request):
    admin = await require_admin(request)
    
    total_participants = await db.users.count_documents({"role": "participant"})
    total_sessions = await db.sessions.count_documents({})
    completed_sessions = await db.sessions.count_documents({"status": "completed"})
    pending_requests = await db.schedule_requests.count_documents({"status": "pending"})
    total_resources = await db.resources.count_documents({"is_deleted": False})
    total_posts = await db.posts.count_documents({})
    
    return {
        "total_participants": total_participants,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "pending_schedule_requests": pending_requests,
        "total_resources": total_resources,
        "total_posts": total_posts,
        "completion_rate": int((completed_sessions / max(total_sessions, 1)) * 100)
    }

# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@clarity.coach").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ClarityAdmin2026!")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Coach Admin",
            "role": "admin",
            "is_active": True,
            "force_password_change": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin account initialized")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "force_password_change": True}}
        )
        logger.info("Admin credentials synchronized")

@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.sessions.create_index("participant_id")
    await db.resources.create_index("participant_id")
    await db.schedule_requests.create_index("participant_id")
    await db.posts.create_index("created_at")
    
    # Seed admin
    await seed_admin()
    
    # Init storage
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    
    # Write test credentials (internal only, not exposed in UI or logs)
    os.makedirs("/app/memory", exist_ok=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@clarity.coach")
    admin_password = os.environ.get("ADMIN_PASSWORD", "ClarityAdmin2026!")
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n\n")
        f.write("## Participant endpoints\n- POST /api/participants (admin creates)\n- GET /api/participants\n- GET /api/participants/:id\n\n")
        f.write("## Session endpoints\n- GET /api/sessions/:participant_id\n- PUT /api/sessions/:session_id\n\n")
        f.write("## Resource endpoints\n- POST /api/resources/upload\n- GET /api/resources/:participant_id\n- GET /api/resources/download/:resource_id\n\n")
        f.write("## Schedule endpoints\n- POST /api/schedule/request\n- GET /api/schedule/all\n- GET /api/schedule/:participant_id\n- PUT /api/schedule/:request_id\n\n")
        f.write("## Feed endpoints\n- POST /api/feed\n- GET /api/feed\n- POST /api/feed/:post_id/like\n\n")
        f.write("## Dashboard\n- GET /api/dashboard/participant\n- GET /api/dashboard/admin\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
