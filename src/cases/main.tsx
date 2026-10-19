import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CasesPage from "./CasesPage";
import "../index.css";
import "../components/perspective-carousel/perspective-carousel.css";
import "./cases.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CasesPage />
  </StrictMode>,
);
