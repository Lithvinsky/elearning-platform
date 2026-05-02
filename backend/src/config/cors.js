import { env } from "./env.js";

/** Comma-separated list (CLIENT_ORIGIN). Use `false` for deny — never pass Error() or CORS becomes HTTP 500. */
const allowedOrigins = [
  ...new Set(
    env.clientOrigin
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ),
];

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};
