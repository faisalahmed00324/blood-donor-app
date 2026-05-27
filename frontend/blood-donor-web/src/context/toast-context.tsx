import { createContext, useCallback, useContext, type ReactNode } from "react";
import {
  Toaster,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastCloseTrigger,
  ToastIndicator,
  createToaster,
} from "@chakra-ui/react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastContextValue = {
  showToast: (title: string, description: string, type: ToastType) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toaster = createToaster({ placement: "top-end", pauseOnPageIdle: true });

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((title: string, description: string, type: ToastType) => {
    toaster.create({ title, description, type, duration: 4000 });
  }, []);

  const success = useCallback((title: string, description?: string) => {
    toaster.create({ title, description, type: "success", duration: 3000 });
  }, []);

  const error = useCallback((title: string, description?: string) => {
    toaster.create({ title, description, type: "error", duration: 5000 });
  }, []);

  const warning = useCallback((title: string, description?: string) => {
    toaster.create({ title, description, type: "warning", duration: 4000 });
  }, []);

  const info = useCallback((title: string, description?: string) => {
    toaster.create({ title, description, type: "info", duration: 3000 });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <ToastIndicator />
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            <ToastCloseTrigger />
          </Toast.Root>
        )}
      </Toaster>
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
