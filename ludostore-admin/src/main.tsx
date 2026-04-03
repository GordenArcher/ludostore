import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global/index.css";
import App from "./App.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <App />
  </StrictMode>,
);
