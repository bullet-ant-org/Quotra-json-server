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

const shell = (title, body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
<h2 style="color:#ff5a00;margin:0 0 16px">Outsider</h2><h3 style="margin:0 0 12px">${title}</h3>${body}
<p style="color:#888;font-size:12px;margin-top:24px">If you didn't ask for this, you can ignore this email.</p></div>`;

export const otpEmail = (code, purpose) => shell(
  purpose === "signup" ? "Confirm your email" : "Your sign-in code",
  `<p>Enter this code in Outsider. It expires in 10 minutes.</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p>`,
);
export const simpleEmail = (title, text) => shell(title, `<p>${text}</p>`);
