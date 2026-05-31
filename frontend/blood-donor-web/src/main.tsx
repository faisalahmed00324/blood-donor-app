import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppChakraProvider } from "./providers/chakra-provider";
import "leaflet/dist/leaflet.css";
import "./map.css";

ReactDOM.createRoot(document.querySelector("#app") as HTMLElement).render(
  <React.StrictMode>
    <AppChakraProvider>
      <App />
    </AppChakraProvider>
  </React.StrictMode>
);
