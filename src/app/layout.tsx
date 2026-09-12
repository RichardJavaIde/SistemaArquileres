// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Rentia",
  description: "Sistema de cobro de alquileres",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
  <ToastProvider>
    <AppShell>{children}</AppShell>
  </ToastProvider>
</body>
    </html>
  );
}