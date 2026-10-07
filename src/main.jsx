import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { AppProvider } from "./appContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("wurzel")).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
