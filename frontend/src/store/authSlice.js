import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  theme: "light",
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { setSession, setAccessToken, clearSession, toggleTheme } = slice.actions;
export default slice.reducer;
