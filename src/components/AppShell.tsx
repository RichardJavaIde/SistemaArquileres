// src/components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuthPage = pathname === "/";

  if (isPublicAuthPage) {
    // Pantalla completa, sin navbar, para el login
    return <div className="min-h-screen flex items-center justify-center px-4">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}