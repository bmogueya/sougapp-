import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "./index.css";
import i18n from "./i18n/config";
import { Dashboard } from "./pages/Dashboard";

/*
 * Auth-free harness for reviewing the Dashboard design in isolation.
 * Query flags:  ?dark  toggles the dark theme,  ?lng=ar|en|fr  switches locale.
 * Not part of the shipped app — safe to delete.
 */
const params = new URLSearchParams(location.search);

if (params.has("dark")) document.documentElement.classList.add("dark");

const lng = params.get("lng");
if (lng) {
  i18n.changeLanguage(lng);
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MemoryRouter>
      <div className="min-h-screen bg-bg p-6">
        <Dashboard />
      </div>
    </MemoryRouter>
  </StrictMode>,
);
