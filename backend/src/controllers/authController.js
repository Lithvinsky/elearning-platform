import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  clearRefreshCookie,
  issueTokens,
  loginUser,
  refreshSession,
  registerUser,
  setRefreshCookie,
} from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  const { accessToken, refreshToken } = await issueTokens(user);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(
    res,
    { user: user.toSafeObject(), accessToken },
    "Registration successful",
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body.email, req.body.password);
  const { accessToken, refreshToken } = await issueTokens(user);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { user: user.toSafeObject(), accessToken }, "Login successful");
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await refreshSession(req.cookies?.refreshToken);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { accessToken }, "Token refreshed");
});

export const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res);
  return sendSuccess(res, null, "Logged out");
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: req.user.toSafeObject() }, "Current user");
});
