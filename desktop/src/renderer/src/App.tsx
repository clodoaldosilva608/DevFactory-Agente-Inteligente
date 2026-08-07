import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BootScreen } from "./components/BootScreen";

export default function App() {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function init() {
      // Check existing session
      try {
        const s = await window.devfactory.auth.getSession();
        setSession(s);
      } catch (err) {
        console.error("Session check failed:", err);
      }
      // Boot animation
      await new Promise((r) => setTimeout(r, 2500));
      setBooting(false);
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
    init();
  }, []);

  if (booting) return <BootScreen />;

  return null;
}
