import { useDispatch, useSelector } from "react-redux";
import { clearSession, setSession, toggleTheme } from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    isAuthenticated: Boolean(auth.accessToken),
    setSession: (session) => dispatch(setSession(session)),
    clearSession: () => dispatch(clearSession()),
    toggleTheme: () => dispatch(toggleTheme()),
  };
}
