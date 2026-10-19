import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContactsPage from "./ContactsPage";
import "../index.css";
import "./contacts.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ContactsPage />
  </StrictMode>,
);
