import { createContext, useContext, type ReactNode } from "react";
import { Alert } from "react-native";

type ToastContextValue = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function show(title: string, description?: string) {
  Alert.alert(title, description);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider
      value={{
        success: show,
        error: show,
        warning: show,
        info: show,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
