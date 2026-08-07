import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BootScreen } from "./components/BootScreen";

type BootState = "loading" | "first-run" | "login" | "dashboard";

export default function App() {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);
  const [state, setState] = useState<BootState>("loading");

  useEffect(() => {
    async function init() {
      // Boot animation minimum
      await new Promise((r) => setTimeout(r, 2500));

      try {
        // Check if user has a stored token
        const token = localStorage.getItem("devfactory_token");

        if (token) {
          // Validate stored session
          const session = await window.devfactory.auth.getSession(token);
          if (session?.user) {
            setState("dashboard");
            setBooting(false);
            setTimeout(() => navigate("/dashboard"), 100);
            return;
          }
          // Token expired — clear
          localStorage.removeItem("devfactory_token");
          localStorage.removeItem("devfactory_user");
        }

        // Check if it's first run (no users in DB)
        const { isFirstRun } = await window.devfactory.auth.isFirstRun();
        if (isFirstRun) {
          setState("first-run");
          setBooting(false);
          setTimeout(() => navigate("/setup"), 100);
        } else {
          setState("login");
          setBooting(false);
          setTimeout(() => navigate("/login"), 100);
        }
      } catch (err) {
        console.error("Init error:", err);
        // Fallback to login
        setState("login");
        setBooting(false);
        setTimeout(() => navigate("/login"), 100);
      }
    }
    init();
  }, []);

  if (booting) return <BootScreen />;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050811]">
      <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400 animate-pulse">
        Inicializando DevFactory...
      </div>
    </div>
  );
}
