import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import { UpdateNotifier } from "./components/UpdateNotifier";
import "./index.css";

// In browser dev mode (no Electron), inject mock API synchronously BEFORE React renders
import "./mock-electron";

// Wrapper that mounts UpdateNotifier on every authenticated page
function WithUpdateNotifier({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpdateNotifier />
      {children}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <WithUpdateNotifier>
            <DashboardPage />
          </WithUpdateNotifier>
        }
      />
      <Route
        path="/settings"
        element={
          <WithUpdateNotifier>
            <SettingsPage />
          </WithUpdateNotifier>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
);
