import { env } from "./env.js";

// Brevo transactional email. Without an API key, emails are logged (dev only).
export async function sendMail(to, subject, html) {
  if (!env.brevoKey) {
    if (env.prod) throw new Error("BREVO_API_KEY is not set");
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${html.replace(/<[^>]+>/g, " ")}`);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.brevoKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: env.mailFrom, to: [{ email: to }], subject, htmlContent: html }),
  });
  if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
}

const C = { orange: "#FF5A00", ink: "#242326", muted: "#6B6762", bg: "#F5F4F2" };
const btn = (href, label) => `<a href="${href}" style="display:inline-block;background:${C.orange};color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">${label}</a>`;
const shell = (title, body, preheader = "") => `<!doctype html><html><body style="margin:0;background:${C.bg};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:24px;overflow:hidden">
<tr><td style="background:${C.orange};padding:22px 28px;color:#fff;font-size:24px;font-weight:800">&#x1F4CD; Outsider</td></tr>
<tr><td style="padding:32px 28px"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">${title}</h1><div style="font-size:16px;line-height:1.6">${body}</div></td></tr>
<tr><td style="padding:18px 28px;background:${C.bg};color:${C.muted};font-size:12px;line-height:1.5">You're getting this because you have an Outsider account. If this wasn't you, ignore this email.<br>Outsider · Go out more.</td></tr>
</table></td></tr></table></body></html>`;
const url = (p) => `${env.clientUrl}${p}`;

export const otpEmail = (code, purpose) => shell(
  purpose === "signup" ? "Confirm your email" : "Your sign-in code",
  `<p>${purpose === "signup" ? "Welcome aboard. Enter this code to finish creating your account." : "Use this code to sign back in."} It expires in 10 minutes.</p>
   <p style="font-size:36px;font-weight:800;letter-spacing:10px;background:${C.bg};border-radius:16px;padding:18px;text-align:center;margin:20px 0">${code}</p>
   <p style="color:${C.muted};font-size:14px">Never share this code. Outsider staff will never ask for it.</p>`, `Your code is ${code}`);
export const welcomeEmail = (name) => shell(`Welcome, ${name}. Time to go out.`,
  `<p>Your account is ready and we've added <b>100 tokens</b> to your wallet.</p><p>Check in at places to earn more, and spend them on daily passes and sponsored events.</p><p style="margin-top:24px">${btn(url("/home"), "Find somewhere to go")}</p>`, "100 tokens are waiting for you");
export const reservationEmail = (title, date, code) => shell("You're in!",
  `<p>Your spot for <b>${title}</b> on <b>${new Date(date).toDateString()}</b> is reserved.</p><p>Show this code or the QR in the app at the door:</p><p style="font-family:monospace;font-size:13px;background:${C.bg};padding:12px;border-radius:12px;word-break:break-all">${code}</p><p>${btn(url("/events"), "View my reservation")}</p>`, `Reserved: ${title}`);
export const passEmail = (title, place, code) => shell("Your pass is ready",
  `<p><b>${title}</b> at <b>${place}</b> is yours for today.</p><p style="font-family:monospace;font-size:13px;background:${C.bg};padding:12px;border-radius:12px;word-break:break-all">${code}</p><p>${btn(url("/wallet"), "Open my pass")}</p>`, `${title} at ${place}`);
export const visitStatusEmail = (place, status) => shell(status === "accepted" ? `${place} is expecting you` : `Update from ${place}`,
  `<p>${status === "accepted" ? `Good news: ${place} accepted your visit request. See you there.` : `${place} can't host your visit on that date. Try another day or another place.`}</p><p>${btn(url("/messages"), "Open messages")}</p>`);
export const placeStatusEmail = (place, status) => shell(status === "live" ? `${place} is live on Outsider` : `About ${place}`,
  `<p>${status === "live" ? "Your place passed review and outsiders can now find it on the map." : `Your place is now marked <b>${status}</b>. Reply to this email if you have questions.`}</p><p>${btn(url("/brand/places"), "Open dashboard")}</p>`);
export const subscriptionEmail = (plan) => shell("Your plan is active", `<p>Your <b>${plan}</b> plan is active. Thanks for growing with Outsider.</p><p>${btn(url("/brand"), "Go to dashboard")}</p>`);
export const paymentFailedEmail = () => shell("We couldn't renew your plan", `<p>Your last payment didn't go through. Update your card to keep your plan active.</p><p>${btn(url("/brand/billing"), "Update card")}</p>`);
export const simpleEmail = (title, text) => shell(title, `<p>${text}</p>`);
