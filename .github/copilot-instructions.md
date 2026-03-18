# Copilot Instructions for AeroBook Web

## Project Overview

AeroBook Web is a Vue 3 + TypeScript frontend for the AeroBook Flight Management System. It provides a role-aware scheduling and management interface for flying clubs, supporting member, aircraft, reservation, flight log, and billing workflows.

## Tech Stack

- **Framework:** Vue 3 (Composition API, <script setup>)
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios (with JWT interceptor)
- **Testing:** Vitest, @vue/test-utils, happy-dom

## Architecture

- **src/main.ts** — App entry point; sets up Pinia and Vue Router.
- **src/App.vue** — Root component; renders <router-view />.
- **src/router/** — Route definitions with authentication and role-based guards.
- **src/stores/auth.ts** — Pinia store for authentication, user state, and permission helpers.
- **src/services/api.ts** — Centralized API client (Axios) with JWT token handling.
- **src/types/** — TypeScript interfaces for API and app data.
- **src/views/** — Page components (Dashboard, Aircraft, Reservations, etc.).
- **src/components/** — Shared UI components.

## Conventions

### API Usage
- All API calls go through `src/services/api.ts`.
- The API base URL is set via the `VITE_API_URL` environment variable (default: `http://localhost:3000/api`).
- JWT tokens are stored in `localStorage` and attached to all requests via Axios interceptor.
- Use the `authAPI` and other exported API helpers for all network requests.

### State & Permissions
- Use the `auth` Pinia store for user state, authentication, and permission checks.
- Permission helpers: `isAdmin`, `isOperator`, `isMember`, `canManageMembers`, etc.
- UI elements and navigation should always check permissions before rendering actions or links.

### Routing
- All protected routes require `meta.requiresAuth: true`.
- Role-based access is enforced via route guards in `src/router/index.ts`.
- Unauthenticated users are redirected to `/login`.

### Error Handling
- API errors should be caught and displayed using user-friendly messages.
- Use a global error handler or per-component error state as appropriate.

### Testing
- Use Vitest for unit and integration tests (`npm run test`).
- Test files are colocated in `src/__tests__/` or alongside components.
- Use `@vue/test-utils` and `happy-dom` for component tests.

## Environment Variables

- `VITE_API_URL` — Base URL for backend API (default: `http://localhost:3000/api`)

## Running & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Example Prompts

- "Add a new page for maintenance logs, with RBAC enforced."
- "Update the reservations view to show only the current user's reservations for members."
- "Add a Pinia store for notifications, with actions and tests."
- "Refactor API calls to use the centralized api.ts client."

## Next Steps

- For advanced customizations, consider creating agent instructions for specific areas (e.g., `/create-instruction frontend-tests` for test conventions, `/create-instruction frontend-api` for API usage patterns).
