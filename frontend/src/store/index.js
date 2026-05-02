import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import authReducer, { clearSession, setAccessToken, setSession } from "./authSlice";

const SESSION_KEY = "learnease_auth_v1";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(setSession, setAccessToken, clearSession),
  effect: (action, api) => {
    if (clearSession.match(action)) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    if (setSession.match(action)) {
      const { user, accessToken } = action.payload;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, accessToken }));
      return;
    }
    if (setAccessToken.match(action)) {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        data.accessToken = action.payload;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  },
});

export function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.accessToken && data?.user) return data;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
