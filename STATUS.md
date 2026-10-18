# Roamly frontend status

## Done (unauthenticated pages)
Landing, Explore (working search and filters over fixtures), Map (MapLibre, OSM tiles), Destination profile,
Community (guest preview), Rewards explainer, For business, About, Terms/Privacy/Token terms/Guidelines (drafts),
Log in, Sign up (explorer/business), Forgot password, 404. Light/dark theme (orange + white, orange + dark gray).

## Not connected
- `src/fixtures/*` are dev samples with fictional businesses. Replace with the API.
- Auth forms validate client-side and call `VITE_API_URL/v1/auth/*`. Unset, they say so instead of faking success.
- Legal pages are unreviewed drafts. Cover art is placeholder until real media exists.
- Map markers and filters use fixtures; real viewport/geo queries need the PostGIS backend.
- PWA: manifest only, no service worker yet.

## Next
Backend API contract, authenticated app shell (home, wallet, messages, notifications), tests.
