import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { loginUser, registerUser, getProfile } from "../api/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("token"),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getProfile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    const { token, user: u } = res.data;
    if (token) localStorage.setItem("token", token);
    if (u) {
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    }
    return u ?? null;
  };

  const register = async (payload) => {
    await registerUser(payload);
    return login(payload.email, payload.password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const refreshUser = async () => {
    const res = await getProfile();
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
