import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Un hoquet réseau transitoire (reconnexion mobile, sortie de veille...)
    // ne doit jamais être confondu avec une vraie déconnexion (401) — sans
    // cette distinction, apiFetch levait la même Error générique dans les
    // deux cas et l'utilisateur se retrouvait déconnecté à chaque coupure
    // passagère au démarrage de l'app, alors que sa session était toujours
    // valide côté serveur.
    async function checkSession() {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const freshUser = await authApi.me();
          if (!cancelled) setUser(freshUser);
          return;
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            if (!cancelled) setUser(null);
            return;
          }
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
      if (!cancelled) setUser(null);
    }

    checkSession().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
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
