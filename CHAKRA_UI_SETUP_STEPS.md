# Chakra UI Setup Steps (React + Vite + TypeScript)

## Goal
Integrate Chakra UI with a clean, scalable setup that keeps bundle size and runtime overhead low.

## 1) Install Dependencies

From frontend project root (`frontend/blood-donor-web`), install:

```bash
npm install @chakra-ui/react @emotion/react
```

Notes:
- Chakra v3 relies on modern styling internals and no longer requires the old framer-motion dependency for basic usage.
- Install icon packages only if needed to keep bundle small.

## 2) Create UI Provider Wrapper

Create `src/providers/chakra-provider.tsx`:

```tsx
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { appTheme } from "../theme";

const system = createSystem(defaultConfig, appTheme);

type Props = {
  children: ReactNode;
};

export function AppChakraProvider({ children }: Props) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
```

## 3) Create Theme Tokens

Create `src/theme/index.ts`:

```ts
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
    },
    semanticTokens: {
      colors: {
        bg: { value: "#f7fbf9" },
        fg: { value: "#1c2b22" },
        accent: { value: "{colors.brand.500}" }
      }
    }
  }
});
```

## 4) Wire Provider in `main.tsx`

Update `src/main.tsx` to wrap app root:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AppChakraProvider } from "./providers/chakra-provider";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppChakraProvider>
      <App />
    </AppChakraProvider>
  </React.StrictMode>
);
```

## 5) Use Chakra Primitives in Pages

Start replacing generic HTML blocks with Chakra components:

- Layout: `Box`, `Container`, `Flex`, `Grid`, `Stack`
- Typography: `Heading`, `Text`
- Forms: `Field`, `Input`, `Select`, `Textarea`, `Button`
- Feedback: `Alert`, `Spinner`, `Skeleton`, `Toast`

Keep custom CSS only for rare page-specific cases.

## 6) Keep Bundle Lean

- Route-split large pages with `React.lazy`.
- Avoid importing full icon libraries by default.
- Prefer server data pagination and smaller payloads.
- Audit bundle after initial migration.

## 7) Accessibility Checklist

- Ensure all form controls have labels.
- Preserve keyboard navigation and visible focus states.
- Use semantic heading hierarchy.
- Validate color contrast for brand colors.

## 8) Suggested Initial Components

Implement these first for consistency:

1. `AppShell` (header, content container, responsive nav)
2. `PageSection` (title + description + content)
3. `StatusBadge` (request/donor statuses)
4. `EmptyState` (no requests/no results)
5. `LoadingState` (skeleton + spinner)

## 9) Quick Verification

Run:

```bash
npm run dev
npm run build
```

Confirm:
- App renders with Chakra styles.
- No hydration/runtime errors.
- Production build completes successfully.

## 10) Migration Approach

- Migrate page-by-page, not all at once.
- Prioritize MVP routes: Auth -> Dashboard -> Requests -> Search.
- Keep old styles temporarily, remove once Chakra version is stable.
