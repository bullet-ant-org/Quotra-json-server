# Roamly frontend status

## Run it
- `npm run dev` — real mode. Without `VITE_API_URL`, auth and sending say the API isn't connected.
- `npm run dev:demo` — demo mode: fake auth in this browser only, code `123456`, sample signed-in data.

## Public pages
Landing, Explore, Map (MapLibre + OSM), Destination, Community, Rewards, For business, About, Terms,
Privacy, Token terms, Guidelines, 404. Mobile bottom dock, light/dark theme.

## Auth (one page: /login, /register, /forgot-password)
- The route you arrive on picks the form; links inside switch modes.
- Login: Google, then email, then password.
- Sign up: Google or first name, last name, username (availability check), email, password, OTP.
- Forgot password: email, then OTP, then signed in.
- Proposed API contract in `src/lib/auth/service.ts`.

## Signed-in pages (behind RequireAuth)
Home, Wallet (balance, challenges, offers, history, badges), Messages (list + thread),
Notifications, Profile, Settings. Destination check-in sheet checks device distance first.

## Not connected
- All data comes from `src/fixtures/*`. Signed-in fixtures must be replaced with real APIs before launch.
- Settings toggles don't persist. Check-ins never award tokens client-side.
- Legal pages are unreviewed drafts. Cover art is placeholder.
- PWA: manifest only.
