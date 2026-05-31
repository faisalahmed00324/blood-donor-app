import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "@/api/types";

type AuthContextValue = {
  auth: AuthResponse | null;
  setAuth: (value: AuthResponse | null) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: string | null;
  canSeek: boolean;
  canManageDonorProfile: boolean;
  hasDonorProfile: boolean;
  isReady: boolean;
};

const AUTH_STORAGE_KEY = "bloodconnect_mobile_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function isExpired(auth: AuthResponse) {
  return new Date(auth.accessTokenExpiresAtUtc) < new Date();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) {
          setIsReady(true);
          return;
        }

        const parsed = JSON.parse(stored) as AuthResponse;
        if (isExpired(parsed)) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setIsReady(true);
          return;
        }

        setAuthState(parsed);
      } catch {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setAuth = async (value: AuthResponse | null) => {
    setAuthState(value);
    if (value) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const logout = async () => {
    setAuthState(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    setAuth,
    logout,
    isAuthenticated: auth !== null,
    userRole: auth?.role ?? null,
    canSeek: auth?.canSeek ?? false,
    canManageDonorProfile: auth?.canManageDonorProfile ?? false,
    hasDonorProfile: auth?.hasDonorProfile ?? false,
    isReady,
  }), [auth, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
