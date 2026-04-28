"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, LayoutTemplate, Settings, LogOut } from "lucide-react";

type SidebarProps = {
  onLogout: () => void;
};

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const mainMenu = [
    { name: "Контрагенты", href: "/counterparties", icon: Users },
    { name: "Документы", href: "/documents", icon: FileText },
    { name: "Шаблоны", href: "/templates", icon: LayoutTemplate },
  ];

  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <aside className="border-b border-[#e5e5e0] bg-[#f7f7f5] px-4 py-4 lg:flex lg:min-h-screen lg:w-[260px] lg:flex-col lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="flex items-center justify-between gap-4 lg:block">
        <Image
          src="/logo.png"
          alt="BRÂLE"
          width={120}
          height={50}
          className="object-contain"
        />

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-[#e5e5e0] px-3 py-2 text-sm text-[#333333] transition hover:bg-[#ececea] lg:hidden"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      <nav className="mt-8 flex gap-2 overflow-x-auto pb-1 lg:mt-12 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {mainMenu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={
                active
                  ? "flex shrink-0 items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm text-white transition lg:gap-3"
                  : "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#333333] transition hover:bg-[#ececea] lg:gap-3"
              }
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-[#333333]"}
              />

              <span className={active ? "text-white" : "text-[#333333]"}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <Link
          href="/settings"
          className={
            isSettingsActive
              ? "flex shrink-0 items-center gap-2 rounded-xl bg-[#ececea] px-4 py-3 text-sm text-[#111111] transition lg:hidden"
              : "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#333333] transition hover:bg-[#ececea] lg:hidden"
          }
        >
          <Settings size={18} className="text-[#333333]" />
          <span>Настройки</span>
        </Link>
      </nav>

      <div className="mt-auto hidden space-y-2 lg:block">
        <Link
          href="/settings"
          className={
            isSettingsActive
              ? "flex w-full items-center gap-3 rounded-xl bg-[#ececea] px-4 py-3 text-[#111111] transition"
              : "flex w-full items-center gap-3 rounded-xl border border-[#e5e5e0] px-4 py-3 text-[#333333] transition hover:bg-[#ececea]"
          }
        >
          <Settings size={18} className="text-[#333333]" />
          <span>Настройки</span>
        </Link>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-[#e5e5e0] px-4 py-3 text-[#333333] transition hover:bg-[#ececea]"
        >
          <LogOut size={18} className="text-[#333333]" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}