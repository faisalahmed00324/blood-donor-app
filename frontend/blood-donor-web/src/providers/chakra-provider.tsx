import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { appTheme } from "../theme";

const system = createSystem(defaultConfig, appTheme);

type AppChakraProviderProps = {
  children: ReactNode;
};

export function AppChakraProvider({ children }: AppChakraProviderProps) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
