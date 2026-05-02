import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "../api/types";

type AuthContextValue = {
  auth: AuthResponse | null;
  setAuth: (value: AuthResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const value = useMemo(() => ({ auth, setAuth }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
