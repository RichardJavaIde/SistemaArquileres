// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Rentia",
  description: "Sistema de cobro de alquileres",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
  <ToastProvider>
    <Navbar />
    <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
  </ToastProvider>
</body>
    </html>
  );
}