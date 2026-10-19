import express from "express";
import http from "node:http";
import { attach } from "./lib/realtime.js";
import uploads from "./routes/uploads.js";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./lib/env.js";
import { errorHandler } from "./lib/http.js";
import { loadUser } from "./lib/auth.js";
import auth from "./routes/auth.js";
import places from "./routes/places.js";
import social from "./routes/social.js";
import rewards from "./routes/rewards.js";
import messages from "./routes/messages.js";
import brand from "./routes/brand.js";
import admin from "./routes/admin.js";
import billing, { webhook } from "./routes/billing.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.origins, credentials: true }));
app.post("/v1/billing/webhook", ...webhook); // raw body: must come before express.json
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60e3, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(loadUser);

app.get("/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use("/v1/auth", auth);
app.use("/v1/places", places);
app.use("/v1", rewards);
app.use("/v1/brand", brand);
app.use("/v1/admin", admin);
app.use("/v1/billing", billing);
app.use("/v1/uploads", uploads);
app.use("/v1", messages);
app.use("/v1", social);
app.use((_req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

await mongoose.connect(env.mongo);
await mongoose.syncIndexes();
const server = http.createServer(app);
attach(server);
server.listen(env.port, () => console.log(`Outsider API on :${env.port}`));
