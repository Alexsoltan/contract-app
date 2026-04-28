"use client";

import { useState } from "react";
import Image from "next/image";
import { login, type AppUser } from "../lib/api";

type LoginScreenProps = {
  onLogin: (user: AppUser) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const user = await login(loginValue, password);

      localStorage.setItem("currentUser", JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f3f1] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="BRÂLE"
            width={140}
            height={60}
            className="mb-4 object-contain"
          />

          <p className="text-neutral-500">Система управления документами</p>
        </div>

        <div className="space-y-4">
          <input
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            placeholder="Логин"
            autoComplete="username"
            className="w-full rounded-2xl border border-[#deded8] bg-[#fafaf8] px-5 py-4 text-[#111] outline-none placeholder:text-neutral-400"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-[#deded8] bg-[#fafaf8] px-5 py-4 text-[#111] outline-none placeholder:text-neutral-400"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-black py-4 text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </main>
  );
}