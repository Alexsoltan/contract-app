"use client";

import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import LoginScreen from "./LoginScreen";

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedAuth = localStorage.getItem("isLoggedIn");

    if (savedAuth === "true") {
      setIsLoggedIn(true);
    }

    setIsReady(true);
  }, []);

  const handleLogin = () => {
    if (login === "asoltan" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Неверный логин или пароль");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setLogin("");
    setPassword("");
    setLoginError("");
  };

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        login={login}
        password={password}
        loginError={loginError}
        setLogin={setLogin}
        setPassword={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return <AppLayout onLogout={handleLogout}>{children}</AppLayout>;
}