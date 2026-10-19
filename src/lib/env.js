import "dotenv/config";

const need = ["MONGODB_URI", "JWT_SECRET"];
for (const k of need) if (!process.env[k]) throw new Error(`Missing env var ${k}`);

export const env = {
  port: +(process.env.PORT ?? 4000),
  prod: process.env.NODE_ENV === "production",
  mongo: process.env.MONGODB_URI,
  jwt: process.env.JWT_SECRET,
  origins: (process.env.CLIENT_ORIGINS ?? "http://localhost:5173").split(",").map((s) => s.trim()),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  apiUrl: process.env.API_URL ?? "http://localhost:4000",
  brevoKey: process.env.BREVO_API_KEY,
  mailFrom: { email: process.env.MAIL_FROM_EMAIL ?? "no-reply@outsider.app", name: process.env.MAIL_FROM_NAME ?? "Outsider" },
  paystackKey: process.env.PAYSTACK_SECRET_KEY,
  googleId: process.env.GOOGLE_CLIENT_ID,
  googleSecret: process.env.GOOGLE_CLIENT_SECRET,
  cloudinary: { cloud: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_KEY, secret: process.env.CLOUDINARY_API_SECRET },
};
