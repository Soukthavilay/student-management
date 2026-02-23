import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http, setAuthFailureHandler } from "../lib/http";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "sm_access_token";
const REFRESH_TOKEN_KEY = "sm_refresh_token";
const USER_KEY = "sm_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function isWebAllowedRole(role) {
  return role === "ADMIN" || role === "LECTURER";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const clearLocalSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await http.get("/auth/me");
        if (!isWebAllowedRole(response.data.user?.role)) {
          clearLocalSession();
        } else {
          setUser(response.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
      } catch (_error) {
        clearLocalSession();
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearLocalSession();
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const response = await http.post("/auth/login", payload);
        const { accessToken, refreshToken, user: loggedUser } = response.data;

        if (!isWebAllowedRole(loggedUser?.role)) {
          throw new Error("Tài khoản này không có quyền truy cập web quản trị");
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
        return loggedUser;
      },
      async logout() {
        try {
          await http.post("/auth/logout");
        } catch (_error) {
          // noop
        }

        clearLocalSession();
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
