import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
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
