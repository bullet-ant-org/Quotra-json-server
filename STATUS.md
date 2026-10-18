# Outsider frontend status

## Demo logins (demo mode only: on whenever VITE_API_URL is unset)
| Role  | Email            | Password  | Lands on |
|-------|------------------|-----------|----------|
| User  | user@gmail.com   | 12345678  | /home (feed) |
| Brand | brand@gmail.com  | 12345678  | /brand |
| Admin | admin@gmail.com  | 12345678  | /admin |
Google sign-in goes to the user feed. Sign-up code: 123456. These accounts must never exist on a real backend.

## User app
Feed (stories, composer with photo/video upload, location and people tags, hashtags, going parties; posts with
photo grid + lightbox, like, comment, repost, book, message place, block), Reels, Events (token reservations with
limited spots + QR), Tokens (daily passes with limited slots), Profile (banner, highlights, posts/reels/tagged),
other profiles at /u/:username, Messages, Notifications, Settings (blocked accounts, security, data).

## Brand dashboard (/brand)
Overview, Feed, My places (submit for review), Ads & promotions, Visit requests, Inbox, Events.

## Admin dashboard (/admin)
Overview, Token passes (budget ÷ tokens per person = spots), Events sponsorship, Users (suspend), Places & brands
(approve), Ads review, Reports.

## Not connected
All state lives in the browser (`src/lib/store.ts`) so the three roles share data on one device. Replace with APIs.
