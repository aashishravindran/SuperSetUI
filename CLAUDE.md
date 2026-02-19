# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Vercel Deployment

**Framework preset:** Vite — build command `npm run build`, output directory `dist`.

**SPA routing:** Vercel serves static files by default, so client-side routes (e.g. `/dashboard`) return 404 on hard refresh without a rewrite rule. A `vercel.json` at the repo root is required:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Environment variable:** Set `VITE_API_BASE_URL` in the Vercel project dashboard to the deployed backend URL (e.g. `https://api.example.com`). It must be prefixed `VITE_` to be inlined at build time by Vite. Without it the app falls back to `http://localhost:8000`.

**WebSocket URL:** `WS_BASE_URL` in `src/lib/api.ts` is derived automatically by replacing the `http` scheme with `ws` — so `https://api.example.com` becomes `wss://api.example.com`. No separate env var is needed. Ensure the backend host supports WebSocket connections (Vercel itself does not run persistent WebSocket servers; the backend must be hosted elsewhere).

## Architecture

**SuperSetUI** is a React 18 + TypeScript SPA for an AI fitness coaching app. It communicates with a FastAPI backend (`http://localhost:8000` by default, override with `VITE_API_BASE_URL`).

### Routing

React Router v6 in `src/App.tsx`. Public routes: `/`, `/login`. All others (`/onboarding`, `/dashboard`, `/workout`, `/history`, `/recovery`) are wrapped in a `ProtectedRoute` that redirects to `/login` if `userId` is null in context.

**Standard user flow:** Landing → Login → (if `is_onboarded`) Dashboard, else Onboarding → Dashboard → Workout or Recovery.

### State Management

Context API + localStorage only — no Redux or Zustand.

- `useUser` hook (`src/hooks/useUser.tsx`) provides `userId`, `login`, `logout`, `isOnboarded`, `setOnboarded`
- `localStorage` keys: `superset_user` (userId), `superset_onboarded` (boolean)
- `UserProvider` wraps the entire app in `main.tsx`

### API Layer

`src/lib/api.ts` exports `apiFetch<T>()`, which wraps `fetch()` and throws `ApiError` (with `status` and `body` fields) on non-2xx responses. All REST calls go through this utility.

`src/hooks/useWebSocket.ts` manages the WebSocket connection to `ws://localhost:8000/ws/workout/{userId}` for real-time workout sessions.

**WebSocket message types sent:** `USER_INPUT`, `LOG_SET`, `LOG_REST`, `RESET_FATIGUE`, `FINISH_WORKOUT`
**Received:** `AGENT_RESPONSE`, `ERROR`

### Styling

Tailwind CSS with CSS variables for theming (HSL format, dark mode via `.dark` class). Custom Tailwind colors map to coach personas: `iron`, `yoga`, `hiit`, `kickboxing`. The `cn()` utility in `src/lib/utils.ts` combines `clsx` + `tailwind-merge`.

### Component Conventions

- `src/components/ui/` — Radix UI–based primitives using CVA for variants (Button, Card, Input, etc.)
- `src/components/` — Domain components (WorkoutCard, ChatMessage, LogSetForm, CoachBadge)
- `src/pages/` — One file per route
- `src/lib/workout.ts` — Data normalization: `normalizeExercises()`, `getWorkoutCoach()`, `getWorkoutTitle()`

Animations use Framer Motion throughout (page transitions, staggered list entrances, SVG effects).

### Key Domain Concepts

- **Coach personas:** Iron (strength), Yoga (flexibility), HIIT (cardio), Kickboxing (power)
- **Fatigue system:** Tracks per-muscle fatigue; weekly workout cap (1–7, configurable via settings)
- **Workout modes:** Trust Max (AI auto-generates full workout) vs. Manual (user-guided chat)
- **Onboarding:** 7-step chat flow collecting fitness metrics → calls `/api/users/{id}/intake` → receives persona recommendations → calls `/api/users/{id}/select-persona`
