import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "../api/types";

type AuthContextValue = {
  auth: AuthResponse | null;
  setAuth: (value: AuthResponse | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: string | null;
  hasRole: (role: string) => boolean;
};

const AUTH_STORAGE_KEY = "bloodconnect_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): AuthResponse | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthResponse;
    if (new Date(parsed.accessTokenExpiresAtUtc) < new Date()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthResponse | null>(loadAuth);

  const setAuth = useCallback((value: AuthResponse | null) => {
    setAuthState(value);
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        setAuthState(e.newValue ? JSON.parse(e.newValue) as AuthResponse : null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = useMemo(() => ({
    auth,
    setAuth,
    logout,
    isAuthenticated: auth !== null,
    userRole: auth?.role ?? null,
    hasRole: (role: string) => auth?.role === role,
  }), [auth, setAuth, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
