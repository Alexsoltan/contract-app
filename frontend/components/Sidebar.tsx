"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FileText,
  LayoutTemplate,
  Settings,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  onLogout: () => void;
};

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const menu = [
    { name: "Контрагенты", href: "/counterparties", icon: Users },
    { name: "Документы", href: "/documents", icon: FileText },
    { name: "Шаблоны", href: "/templates", icon: LayoutTemplate },
    { name: "Настройки", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-[#f7f7f5] px-6 py-8 flex flex-col justify-between border-r border-[#e5e5e0]">
      <div>
        <div className="mb-10">
          <Image
            src="/logo.png"
            alt="BRÂLE"
            width={120}
            height={50}
            className="object-contain"
          />

          <p className="text-xs text-neutral-400 mt-3 leading-snug">
            Система управления
            <br />
            документами
          </p>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-black !text-white text-white transition"
                    : "flex items-center gap-3 px-4 py-3 rounded-xl text-[#333333] hover:bg-[#ececea] transition"
                }
              >
                <Icon
                  size={18}
                  className={active ? "text-white" : "text-[#333333]"}
                />

                <span
                  className={
                    active ? "!text-white text-white" : "text-[#333333]"
                  }
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e5e5e0] text-[#333333] hover:bg-[#ececea] transition"
      >
        <LogOut size={18} className="text-[#333333]" />
        <span className="text-[#333333]">Выйти</span>
      </button>
    </aside>
  );
}