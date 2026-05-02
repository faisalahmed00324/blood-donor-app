import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppChakraProvider } from "./providers/chakra-provider";

ReactDOM.createRoot(document.querySelector("#app") as HTMLElement).render(
  <React.StrictMode>
    <AppChakraProvider>
      <App />
    </AppChakraProvider>
  </React.StrictMode>
);
