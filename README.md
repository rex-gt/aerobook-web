# AeroBook Flight Management System - Web

Vue 3 frontend web application for AeroBook Flight Management System — a role-aware scheduling and management interface for flying clubs.

## Features

- **Modern Responsive Design** — Optimized for all devices using a hybrid layout: high-density tables for desktop and clean, stackable cards for mobile.
- **Role-Based Access Control (RBAC)** — Admin, Operator, and Member roles with enforced permissions and adapted UI.
- **Smart Dashboard** — Personalized stats and recent activity. Members see their own upcoming reservations, while admins see club-wide data.
- **Member Management** — Admin-only interface to manage members with optional welcome email suppression.
- **Aircraft Fleet Management** — Comprehensive fleet tracking including tach hours and hourly rates.
- **Reservation System** — Full-featured calendar (Day/Week/Month views) with mobile-optimized navigation, dynamic local timezone detection, and timezone indicators when booking or viewing reservations.
- **UI Cleanup** — Technical database IDs removed from all user-facing views for a more professional experience.
- **Security** — JWT Authentication with automatic session handling and secure HTTPS support.
- **Password Reset** — Complete "Forgot Password" flow with 10-minute secure email links.
- **"What's New" Modal** — Configurable pop-up modal with scheduling controls to present new features, updates, or announcements to users upon login.

## Tech Stack

- **Vue 3** — Composition API with `<script setup>`
- **TypeScript** — Type-safe development
- **Vite** — Dev server and build tool
- **Vue Router** — Client-side routing with authentication and role guards
- **Pinia** — State management with permission helpers
- **Axios** — HTTP client with JWT interceptor
- **Vanilla CSS** — Custom responsive design system without external CSS frameworks

## Deployment & Environments

AeroBook Web supports four distinct environments to streamline development and testing.

### 1. Environment Overview

| Environment | Purpose | Target URL | Backend API | Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Local** | Local Development | `http://localhost:5173` | `https://localhost:3000/api` | `npm run dev` |
| **Development** | Hosted Dev/Test | (Vercel Preview URL) | `...-api-staging.up.railway.app` | `npm run deploy:dev` |
| **Preview** | Shared Preview | `https://preview.aerobook.app/` | `...-api-staging.up.railway.app` | Push to `preview` branch |
| **Production** | Live Production | `https://aerobook.app/` | `...-api-production.up.railway.app` | Push to `main` branch |

### 2. Configuration (.env Files)

The project uses separate `.env` files for each environment. **Do not commit these files** (except for `.env.example`).

- `.env.local`: Local development settings.
- `.env.development`: Settings for the hosted Development environment.
- `.env.preview`: Settings for the Shared Preview environment.
- `.env.production`: Settings for the Live Production environment.

To sync your local environment variables to Vercel:
```bash
npm run env:sync
```

### 3. Deployment Workflow

We recommend using the interactive deployment menu for all manual pushes:

```bash
npm run deploy
```

#### Manual Commands:
- **Deploy to Development**: `npm run deploy:dev` (Manual CLI push)
- **Deploy to Production**: `npm run deploy:prod` (Manual CLI push)

#### Automated CI/CD:
- **Preview**: Push to the `preview` branch on GitHub to update `https://preview.aerobook.app/`.
- **Production**: Merge/Push to the `main` branch on GitHub to update `https://aerobook.app/`.

---

## Project Structure

```
.
├── GEMINI.md            # Project mandates and development rules
├── scripts/             # Vercel deployment and utility scripts
├── .env.development     # Hosted Dev settings (Gitignored)
├── .env.local           # Local settings (Gitignored)
├── .env.preview         # Shared Preview settings (Gitignored)
├── .env.production      # Production settings (Gitignored)
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── src/
    ├── App.vue          # Root component
    ├── main.ts          # Application entry point
    ├── style.css        # Global responsive design system & variables
    ├── components/
    │   └── AppLayout.vue # Main layout with responsive header and drawer
    ├── router/
    │   └── index.ts      # Routes with role-based navigation guards
    ├── stores/
    │   └── auth.ts       # Pinia auth store with permission logic
    ├── types/
    │   └── index.ts      # TypeScript interfaces
    ├── services/
    │   └── api.ts        # Typed API service layer
    └── views/
        ├── Dashboard.vue     # Main landing page with club stats
        ├── Aircraft.vue      # Fleet management
        ├── Reservations.vue  # Mobile-friendly booking calendar
        ├── Members.vue       # User administration (Admin only)
        └── ...
```

## User Roles & Permissions

### Admin
Full access to everything:
- Manage members (CRUD) — `/members`
- Manage aircraft (CRUD)
- Manage all reservations
- View all flight logs
- Manage all billing

### Operator
Operational management:
- Manage aircraft (CRUD)
- Manage all reservations
- View all flight logs
- Manage billing
- Cannot manage members

### Member
Personal access only:
- View own reservations; create new reservations
- View own flight logs
- View own billing
- Cannot manage aircraft, other members' data, or billing records

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Ensure your `.env.development.local` is set up with the correct local backend URL.

3. **Start dev server:**
   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | admin |
| operator@example.com | password123 | operator |
| member@example.com | password123 | member |

## License

MIT
