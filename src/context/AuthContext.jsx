import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(details) {
    const registeredUser = await authApi.register(details);
    setUser(registeredUser);
    return registeredUser;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function refreshUser() {
    const freshUser = await authApi.me();
    setUser(freshUser);
    return freshUser;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
