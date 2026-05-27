import { defineConfig } from "@chakra-ui/react";

export const appTheme = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#dc2626" },
          600: { value: "#b91c1c" },
          700: { value: "#991b1b" },
          800: { value: "#7f1d1d" },
          900: { value: "#450a0a" }
        }
      },
      fonts: {
        heading: { value: "'Inter', system-ui, sans-serif" },
        body: { value: "'Inter', system-ui, sans-serif" }
      }
    }
  }
});
