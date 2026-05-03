import { env } from "./env.js";

const fromEnv = env.clientOrigin
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set(fromEnv)];

/** Vercel production + preview URLs for this project (hostname prefix after HTTPS). */
const vercelLearnEase = /^https:\/\/elearning-platform[\w-]*\.vercel\.app$/i;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (vercelLearnEase.test(origin)) return true;
  return false;
}

/**
 * Do not set `allowedHeaders` to a short fixed list — browsers (and Vercel/Sentry) may send
 * extra Access-Control-Request-Headers on preflight; the cors package defaults to echoing
 * those when `allowedHeaders` is omitted.
 */
export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};
