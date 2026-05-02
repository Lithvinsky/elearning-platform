import { env } from "./env.js";

const allowedOrigins = env.clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin blocked"));
  },
  credentials: true,
};
