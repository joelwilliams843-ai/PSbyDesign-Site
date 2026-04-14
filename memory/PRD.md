# CLARITY Executive Coaching Dashboard - PRD

## Original Problem Statement
Build a production-ready web + mobile app called "CLARITY Executive Coaching Dashboard" - a structured coaching platform that tracks participant progress across a 10-session executive coaching program with centralized resources, assessments, and engagement.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (motor async driver)
- **File Storage**: Emergent Object Storage
- **Auth**: JWT (httpOnly cookies) with role-based access

## User Personas
1. **Admin / Coach** - Creates participant accounts, manages sessions, uploads documents, approves scheduling, moderates community
2. **Participant** - Views progress dashboard, downloads resources, requests sessions, posts in community feed

## Core Requirements
- No public self-registration (admin creates accounts)
- Data isolation per participant
- Secure file scoping per participant
- Premium enterprise UI aesthetic

## What's Been Implemented (April 14, 2026)

### MVP Features (Complete)
1. **Authentication** - JWT login/logout, role-based access, brute force protection, admin seeding
2. **Participant Dashboard** - 10-session progress tracker with visual progress bar, journey phase indicator, next session display, resource/session previews
3. **Admin Dashboard** - Stats overview (participants, completion rate, pending requests, resources), participant list with progress bars
4. **Session Tracking** - 10 sessions auto-created per participant, admin marks complete with notes, timestamp tracking
5. **Resource Hub** - 6 document types (Resource Guide, 360 Assessment, 16 Personalities, Midway Report, Graduation Report, Certificate), card-based UI, download capability
6. **Document Upload** - Admin uploads files per participant via Emergent Object Storage, version control (auto-replaces previous), file categorization
7. **Scheduling** - Participant requests session times, admin approves/adjusts/declines with notes, calendar picker
8. **Community Feed** - Post best practices or motivational quotes, like/react functionality
9. **Participant Management** - Admin creates accounts, views all participants with progress

### Security Hardening (Complete - April 14, 2026)
1. **Force Password Change** - All new accounts require password change on first login
2. **Change Password** - All users can change password at /settings
3. **Admin Controls** - Deactivate/activate participants, reset passwords, archive accounts
4. **Data Isolation** - Strict per-participant data isolation enforced on all API endpoints
5. **File Security** - All file downloads require authentication, no public URLs
6. **No Exposed Credentials** - No credentials logged or displayed in UI
7. **Account Deactivation** - Deactivated accounts blocked from login (403)

### API Endpoints
- Auth: POST /api/auth/login, /logout, GET /me, POST /refresh
- Participants: POST/GET /api/participants, GET /api/participants/:id
- Sessions: GET /api/sessions/:pid, PUT /api/sessions/:sid
- Resources: POST /api/resources/upload, GET /api/resources/:pid, GET /api/resources/download/:rid, DELETE /api/resources/:rid
- Schedule: POST /api/schedule/request, GET /api/schedule/all, GET /api/schedule/:pid, PUT /api/schedule/:rid
- Feed: POST/GET /api/feed, POST /api/feed/:pid/like
- Dashboard: GET /api/dashboard/participant, GET /api/dashboard/admin

### Database Schema (MongoDB)
- **users**: email, name, role, password_hash, created_at
- **sessions**: id, participant_id, session_number, status, notes, scheduled_date, completed_at
- **resources**: id, participant_id, type, storage_path, original_filename, content_type, size, uploaded_at, is_deleted
- **schedule_requests**: id, participant_id, participant_name, requested_date/time, status, admin_notes, adjusted_date/time
- **posts**: id, user_id, user_name, user_role, content, type, likes[], created_at
- **login_attempts**: identifier, count, last_attempt

## Prioritized Backlog

### P0 (Critical - Done)
- [x] Auth with role-based access
- [x] Participant dashboard with progress tracker
- [x] Session tracking
- [x] Resource hub with file upload/download
- [x] Scheduling system
- [x] Community feed

### P1 (Phase 2 - Not Started)
- [ ] Email notifications (session reminders, resource uploads)
- [ ] Google Calendar integration
- [ ] Direct messaging between coach and participant
- [ ] Analytics dashboard (engagement rates, completion trends)

### P2 (Future)
- [ ] Password change/reset flow
- [ ] Multiple coach support
- [ ] Session video recording links
- [ ] Mobile-optimized PWA
- [ ] Export reports as PDF
- [ ] Bulk participant import (CSV)

## Next Tasks
1. Add email notifications for session completions and resource uploads
2. Calendar integration (Google Calendar)
3. Coach-participant messaging
4. Analytics/reporting dashboard
5. Password change functionality for participants
