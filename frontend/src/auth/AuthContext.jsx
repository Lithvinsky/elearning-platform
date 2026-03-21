import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: () => {},
  refreshUser: async () => {},
});

export default AuthContext;
