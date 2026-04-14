# Performance Solutions by Design — Website + Clarity Platform

## Overview

A modern, premium executive consulting website for Performance Solutions by Design (PSD) with an integrated Clarity executive coaching platform.

## Architecture

```
Frontend (React SPA)
├── / — PSD Marketing Website (Home, About, Services, Industries, Contact)
├── /clarity — Clarity product landing page
├── /clarity/app — Clarity coaching platform (requires login)
└── Backend (FastAPI + MongoDB)
    └── /api/* — All API endpoints
```

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Shadcn UI, React Router
- **Backend**: FastAPI, MongoDB (Motor async driver)
- **Auth**: JWT Bearer tokens (localStorage)
- **File Storage**: Emergent Object Storage
- **Deployment**: Netlify (frontend) + separate backend host

## Deployment Guide

### Option 1: Netlify (Recommended)

1. **Push to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Link the GitHub repo in Netlify
   - Set build settings:
     - **Build command**: `yarn build`
     - **Publish directory**: `build`
     - **Base directory**: `frontend` (if monorepo)

3. **Set Environment Variables in Netlify**
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```

4. **SPA Routing**
   Already configured via `public/_redirects` and `netlify.toml`:
   ```
   /* /index.html 200
   ```

5. **Custom Domain**
   - Add your domain in Netlify > Domain settings
   - Update DNS at your registrar (remove GoDaddy hosting, point to Netlify)
   - Enable HTTPS (automatic with Netlify)

### Option 2: Backend Hosting

The backend (FastAPI + MongoDB) needs a separate host:
- **Railway**, **Render**, or **Fly.io** (recommended)
- Set these env vars on the backend host:
  ```
  MONGO_URL=mongodb+srv://...
  DB_NAME=clarity_production
  JWT_SECRET=<random-64-char-hex>
  ADMIN_EMAIL=joel@mjvholdings.com
  ADMIN_PASSWORD=<secure-password>
  EMERGENT_LLM_KEY=<your-key>
  ```

## Project Structure

```
frontend/
├── public/
│   ├── _redirects          # Netlify SPA routing
│   └── index.html
├── netlify.toml            # Netlify build config
├── src/
│   ├── App.js              # Main router (website + app)
│   ├── contexts/
│   │   └── AuthContext.js   # Auth + API client
│   ├── components/
│   │   ├── Navbar.js       # Website navigation
│   │   ├── Footer.js       # Website footer
│   │   ├── Sidebar.js      # Clarity app sidebar
│   │   ├── ProgressTracker.js
│   │   └── ui/             # Shadcn components
│   └── pages/
│       ├── site/           # PSD website pages
│       │   ├── HomePage.js
│       │   ├── AboutPage.js
│       │   ├── ServicesPage.js
│       │   ├── IndustriesPage.js
│       │   ├── ClarityLandingPage.js
│       │   └── ContactPage.js
│       ├── LoginPage.js    # Clarity app login
│       ├── ParticipantDashboard.js
│       ├── AdminDashboard.js
│       └── ... (other app pages)
└── package.json

backend/
├── server.py               # FastAPI application
├── .env                    # Environment variables
└── requirements.txt
```

## URL Structure

| Route | Content |
|---|---|
| `/` | PSD Homepage |
| `/about` | About PSD |
| `/services` | Services page |
| `/industries` | Industries page |
| `/clarity` | Clarity product page |
| `/contact` | Contact form |
| `/clarity/app` | Clarity dashboard (auth required) |
| `/clarity/app/login` | Login page |
| `/clarity/app/resources` | Resource hub |
| `/clarity/app/schedule` | Scheduling |
| `/clarity/app/community` | Community feed |
| `/clarity/app/settings` | Change password |
| `/clarity/app/admin/*` | Admin management |

## Clarity App Integration

The Clarity app is **fully integrated** into the PSD website as a React route, not an iframe or subdomain. This means:

- Single build, single deploy
- Shared styling and components
- Seamless navigation between website and app
- No CORS issues between site and app
- SPA routing works on refresh (via `_redirects`)

**Recommendation**: Keep Clarity as an integrated route within the main site. This is the cleanest approach for:
- GitHub management (one repo)
- Netlify deployment (one build)
- Domain handling (no subdomain needed)
- SEO (Clarity marketing page is indexable)

## Migration from GoDaddy

1. Build and deploy to Netlify first (verify everything works on the Netlify URL)
2. In your domain registrar, update DNS to point to Netlify
3. Remove GoDaddy hosting (keep domain registration if it's there)
4. Enable HTTPS in Netlify (automatic)
5. The `REACT_APP_BACKEND_URL` env var points to your backend — update this if the backend moves

## Admin Credentials

- **Email**: joel@mjvholdings.com
- **Password**: TempAccess123! (change after deployment)
