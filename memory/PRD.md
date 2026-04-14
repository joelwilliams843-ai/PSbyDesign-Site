# CLARITY Executive Coaching Dashboard + PSD Website - PRD

## Original Problem Statement
Build a complete modernization of the Performance Solutions by Design website and integrate the Clarity executive coaching app as a branded product within the site ecosystem. Must be production-ready for GitHub + Netlify deployment.

## Architecture
- **Frontend**: Single React SPA (marketing site + Clarity app)
- **Backend**: FastAPI + MongoDB (separate deployment)
- **Auth**: JWT Bearer tokens via localStorage
- **File Storage**: Emergent Object Storage
- **Deployment**: Netlify (frontend) + separate backend host

## What's Been Implemented

### PSD Website (April 14, 2026)
1. **Homepage** - Hero, services overview, industries, Clarity teaser, credibility stats, CTA
2. **About Page** - Founder bio, company values, testimonials
3. **Services Page** - Consulting, Executive Coaching, Workshops, Learning Resources
4. **Industries Page** - 10 industries with descriptions in grid layout
5. **Clarity Landing Page** - Product marketing with features, benefits, app preview
6. **Contact Page** - Contact form + Calendly integration
7. **Navbar** - Sticky nav with all pages + Clarity Login CTA
8. **Footer** - PSD branding, nav links, social media, contact info

### Clarity App (Previously Built)
1. Auth (JWT Bearer, force password change, admin controls)
2. 10-session progress tracker
3. Resource Hub (6 document types)
4. Session Scheduling
5. Community Feed
6. Admin Dashboard

### Deployment Config
- `_redirects` for Netlify SPA routing
- `netlify.toml` for build config
- README with full deployment guide

## Prioritized Backlog
- [ ] Email notifications
- [ ] Google Calendar integration
- [ ] Coach-participant messaging
- [ ] Analytics dashboard
- [ ] Bulk participant import
