"use client";

import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
  onLogout: () => void;
};

export default function AppLayout({ children, onLogout }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f3f3f1] flex text-[#111]">
      <Sidebar onLogout={onLogout} />
      <section className="flex-1 px-10 py-8">{children}</section>
    </main>
  );
}