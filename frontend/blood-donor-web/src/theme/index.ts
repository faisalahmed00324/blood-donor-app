import { defineConfig } from "@chakra-ui/react";

export const appTheme = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#eef8f3" },
          100: { value: "#d6ecdf" },
          200: { value: "#aed8bf" },
          300: { value: "#86c59f" },
          400: { value: "#5fb17f" },
          500: { value: "#3f8f62" },
          600: { value: "#306f4c" },
          700: { value: "#235237" },
          800: { value: "#153521" },
          900: { value: "#08190d" }
        }
      },
      fonts: {
        heading: { value: "Poppins, system-ui, sans-serif" },
        body: { value: "Inter, system-ui, sans-serif" }
      }
    }
  }
});
