# HealEasy — React + Vite

A React + Vite port of the original HealEasy HTML/CSS/vanilla-JS frontend.
Design, layout, animations, color palette, typography and responsiveness are
all preserved — the original CSS files are reused as-is (just split under
`src/styles/`), and all markup/classes match the original build 1:1.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
```

## Project structure

```
HealEasy/
├── public/
├── src/
│   ├── assets/            # images / icons / fonts (empty placeholders, ready to use)
│   ├── components/        # reusable UI building blocks
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── SearchBar.jsx
│   │   ├── QuickActions.jsx
│   │   ├── HospitalCard.jsx
│   │   ├── BottomNav.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Toast.jsx
│   │   ├── GlobalEffects.jsx   # ripple / favourite-toggle / auth-gate click delegation
│   │   └── PageShell.jsx       # shared app-shell + skip-link + bottom nav + modal wrapper
│   │
│   ├── pages/
│   │   ├── Splash.jsx
│   │   ├── Dashboard.jsx
│   │   ├── HospitalSearch.jsx
│   │   ├── HospitalDetails.jsx
│   │   ├── AIAssistant.jsx
│   │   └── Profile.jsx
│   │
│   ├── context/
│   │   └── UIContext.jsx   # toast + login-modal global state
│   │
│   ├── hooks/
│   │   ├── usePageEffects.js   # scroll-reveal, animated counters, parallax (per page)
│   │   ├── useStickyNavbar.js
│   │   └── useGreeting.js
│   │
│   ├── data/
│   │   └── hospitals.js    # mock data shaped like a future Django REST response
│   │
│   ├── styles/              # original CSS files, imported via styles/index.css
│   ├── App.jsx               # React Router routes
│   └── main.jsx
```

## Routing

| Route                          | Page             | Auth required |
|---------------------------------|------------------|:---:|
| `/`                              | Splash           | |
| `/dashboard`                     | Dashboard        | |
| `/hospital-search`               | Hospital Search  | |
| `/hospital-details/:id`          | Hospital Details | |
| `/ai-assistant`                  | AI Assistant     | |
| `/profile`                       | Profile          | |
| `/book-appointment`              | Book Appointment | ✓ |
| `/get-token`                     | Get Token        | ✓ |
| `/my-appointments`               | My Appointments  | ✓ |
| `/my-tokens`                     | My Tokens        | ✓ |

## Authentication prototype

There is no backend — `AuthContext.jsx` simulates a session in
`localStorage` under the `healeasy_user` key. Signing in or creating an
account (via the shared modal in `LoginModal.jsx`) writes that record and
the person is immediately routed to whatever they originally asked for
(the intended path is threaded through `UIContext`'s `modalRedirect`, or
`RequireAuth.jsx` for direct URL access to a protected route).

Appointments and queue tokens are likewise stored client-side in
`localRecords.js` under `healeasy_appointments` and `healeasy_tokens`, so
they persist across a refresh without any server.

## Wiring up a Django REST backend

The frontend is deliberately structured so a Django REST Framework backend
can be dropped in with minimal changes:

- `src/data/hospitals.js`, `src/data/doctors.js`, and `src/data/departments.js`
  mirror the exact shape `GET /api/hospitals/`, `GET /api/doctors/`, and
  `GET /api/departments/` endpoints should return — swap the static arrays
  for `fetch()`/`axios` calls without touching component markup.
- `src/data/localRecords.js` mirrors `GET/POST /api/appointments/` and
  `GET/POST /api/tokens/` — swap the `localStorage` reads/writes for real
  requests once a backend exists.
- The login/signup form in `LoginModal.jsx` already `preventDefault()`s and
  is ready to be pointed at `POST /api/auth/login/` and
  `POST /api/auth/signup/` endpoints; `AuthContext.jsx` is the single spot
  that would switch from simulated to real sessions.
- Anything requiring authentication is already gated behind the
  `data-requires-auth="<reason>"` attribute (optionally paired with
  `data-auth-redirect="<path>"`) plus the shared login modal, or behind
  `RequireAuth.jsx` for whole routes.
- All hospital/doctor/department IDs used in routes/links are plain slugs,
  matching what a Django model's `slug` field would naturally produce.

## Preserved behaviours from the original vanilla JS

| Original file       | Where it lives now                              |
|----------------------|--------------------------------------------------|
| `app.js` (toast, active nav, page transition) | `UIContext.jsx`, `BottomNav.jsx` (via `NavLink`), `PageShell.jsx` |
| `scroll.js` (reveal, sticky navbar, parallax) | `usePageEffects.js`, `useStickyNavbar.js` |
| `animation.js` (ripple, favourites)            | `GlobalEffects.jsx` |
| `counter.js` (animated stat counters)          | `usePageEffects.js` |
| `modal.js` (login modal, focus trap)           | `LoginModal.jsx`, `UIContext.jsx` |
| `greeting.js`                                   | `useGreeting.js` |
| `dashboard.js` (splash progress, hero search)  | `Splash.jsx`, `SearchBar.jsx` |
