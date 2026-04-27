"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type LoginScreenProps = {
  login: string;
  password: string;
  loginError: string;
  setLogin: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
};

export default function LoginScreen({
  login,
  password,
  loginError,
  setLogin,
  setPassword,
  onLogin,
}: LoginScreenProps) {
  const loginInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loginInputRef.current?.focus();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f3f1] flex items-center justify-center px-6">
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#e5e5e0] p-10 shadow-sm">
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png"
            alt="BRÂLE"
            width={170}
            height={80}
            className="object-contain"
          />

          <p className="mt-4 text-sm text-neutral-500 tracking-wide text-center">
            Система управления документами
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm mb-2 text-neutral-600">
              Логин
            </label>

            <input
              ref={loginInputRef}
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Введите логин"
              className="w-full px-5 py-4 rounded-2xl border border-[#dcdcd7] bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-neutral-600">
              Пароль
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              className="w-full px-5 py-4 rounded-2xl border border-[#dcdcd7] bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition"
            />
          </div>

          {loginError && (
            <p className="text-sm text-red-600">{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-2xl hover:bg-[#2a2a2a] transition mt-2"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}