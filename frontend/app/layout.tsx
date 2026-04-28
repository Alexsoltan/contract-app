import type { Metadata } from "next";
import { IBM_Plex_Sans, Rubik } from "next/font/google";
import AuthGate from "../components/AuthGate";
import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brele Документы",
  description: "Система управления документами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${plex.variable} ${rubik.variable}`}>
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}