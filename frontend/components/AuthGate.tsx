"use client";

import { useEffect, useState } from "react";
import LoginScreen from "./LoginScreen";
import AppLayout from "./AppLayout";
import type { AppUser } from "../lib/api";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }

    setReady(true);
  }, []);

  const handleLogin = (nextUser: AppUser) => {
    localStorage.setItem("currentUser", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  if (!ready) {
    return null;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <AppLayout onLogout={handleLogout}>{children}</AppLayout>;
}