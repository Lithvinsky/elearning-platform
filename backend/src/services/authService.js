import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "refreshToken";
const SALT_ROUNDS = 10;

function refreshCookieOptions() {
  const sameSite = env.refreshCookieSameSite === "none" ? "none" : "lax";
  return {
    httpOnly: true,
    secure: sameSite === "none" || env.nodeEnv === "production",
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function registerUser(payload) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: payload.role || "learner",
    department: payload.department || "",
  });
  return user;
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select("+passwordHash +refreshTokenHash");
  if (!user) throw new AppError("Invalid email or password", 401);
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid email or password", 401);
  return user;
}

export async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    path: "/",
    sameSite: refreshCookieOptions().sameSite,
    secure: refreshCookieOptions().secure,
  });
}

export async function refreshSession(rawRefreshToken) {
  if (!rawRefreshToken) throw new AppError("Unauthorized", 401);
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Unauthorized", 401);
  }
  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) throw new AppError("Unauthorized", 401);
  if (user.refreshTokenHash !== hashToken(rawRefreshToken)) {
    throw new AppError("Unauthorized", 401);
  }
  const { accessToken, refreshToken } = await issueTokens(user);
  return { user, accessToken, refreshToken };
}
