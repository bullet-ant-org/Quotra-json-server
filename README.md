# Outsider API

Node.js + Express + MongoDB Atlas (Mongoose). Brevo for email, Paystack for brand subscriptions.

## Run locally
```bash
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, BREVO_API_KEY, PAYSTACK_SECRET_KEY, Google keys
npm install
SEED_DEMO_ACCOUNTS=true npm run seed   # places, plans, demo admin/brand/user (password 12345678)
npm run paystack:plans    # creates the plans on Paystack and stores their plan codes
npm run dev               # http://localhost:4000/health
```
Then set `VITE_API_URL=http://localhost:4000` in the frontend (this switches demo mode off).

## Deploy (Render or Railway)
- Build: `npm install` · Start: `npm start` · Node 20+
- Env vars from `.env.example`, with `NODE_ENV=production`, `API_URL` = the API's public URL, `CLIENT_URL` and `CLIENT_ORIGINS` = your Vercel URL.
- Atlas → Network Access: allow the host's outbound IPs (or 0.0.0.0/0 while testing).
- Paystack dashboard → Settings → API Keys & Webhooks → Webhook URL: `https://<api>/v1/billing/webhook`
- Google console → OAuth client → Authorized redirect URI: `https://<api>/v1/auth/google/callback`
- Brevo → verify the sender in `MAIL_FROM_EMAIL`.
- Cookies are `SameSite=None; Secure` in production, so frontend and API must both be on HTTPS.

## API (all under /v1, JSON, cookie session)
| Area | Endpoints |
|---|---|
| Auth | `POST auth/login` · `POST auth/logout` · `GET auth/me` · `POST auth/username-available` · `POST auth/register/request-otp` · `POST auth/register/verify-otp` · `POST auth/password/request-otp` · `POST auth/password/verify-otp` · `GET auth/google` |
| Map & places | `GET places?bbox=minLng,minLat,maxLng,maxLat` · `GET places?near=lng,lat&radiusKm=` · `&q= &category= &verified=1 &minRating= &maxPrice=` · `GET places/:slug` · `POST places/:slug/check-in {lat,lng,accuracy}` |
| Social | `GET feed?before=` · `GET reels` · `POST posts` · `DELETE posts/:id` · `POST posts/:id/like` · `POST posts/:id/comments` · `POST posts/:id/repost` · `POST posts/:id/party` · `GET/POST stories` · `GET users/:username` · `POST users/:id/follow` · `POST users/:id/block` · `GET me/blocked` · `PATCH me` · `GET/POST/DELETE me/highlights` · `POST reports` |
| Rewards | `GET wallet` · `GET passes` · `POST passes/:id/claim` · `GET events?near=&sponsored=1` · `POST events/:id/reserve` · `GET verify/:code` (brand/admin) |
| Messages | `GET/POST conversations` · `GET/POST conversations/:id/messages` · `GET notifications` · `POST notifications/read` |
| Brand | `GET brand/overview` · `GET/POST/PATCH brand/places` · `GET/POST/PATCH brand/ads` · `GET/PATCH brand/requests` · `GET/POST brand/events` · `POST brand/visit-requests` (explorers) |
| Admin | `GET admin/overview` · `GET/POST/PATCH admin/passes` · `GET admin/events` · `PATCH admin/events/:id/sponsor` · `GET/PATCH admin/users` · `POST admin/users/:id/tokens` · `GET/PATCH admin/places` · `GET/PATCH admin/ads` · `GET/PATCH admin/reports` |
| Billing | `GET billing/plans` · `POST billing/plans` (admin) · `GET billing/subscription` · `POST billing/subscribe` → Paystack checkout URL · `GET billing/verify/:reference` · `POST billing/manage` · `POST billing/cancel` · `POST billing/webhook` |

## Guarantees
- Token balance only changes through `moveTokens` inside a Mongo transaction, with a unique ledger `ref`, so retries never double-charge or double-reward.
- Pass claims and event reservations are atomic: the spot and the tokens are taken together or not at all, and spots can't be oversold.
- Check-ins are verified on the server against the venue's radius and rewarded once per place per day.
- Paystack payments are trusted only after `verify` or a signed webhook.

## Not included yet
- Media uploads: posts accept image/video URLs. Add Cloudinary or S3 signed uploads for files from the device.
- Real-time chat: messages are REST. Add Socket.IO for live delivery.
