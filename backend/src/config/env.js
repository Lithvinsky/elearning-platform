import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

function trimEnv(value) {
  return typeof value === "string" ? value.trim() : "";
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: trimEnv(process.env.MONGO_URI),
  jwtAccessSecret: trimEnv(process.env.JWT_ACCESS_SECRET),
  jwtRefreshSecret: trimEnv(process.env.JWT_REFRESH_SECRET),
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    "http://localhost:5173,https://elearning-platform-orpin-zeta.vercel.app",
  refreshCookieSameSite: process.env.REFRESH_COOKIE_SAMESITE || "lax",
};

export function assertEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push("MONGO_URI");
  if (!env.jwtAccessSecret) missing.push("JWT_ACCESS_SECRET");
  if (!env.jwtRefreshSecret) missing.push("JWT_REFRESH_SECRET");
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
