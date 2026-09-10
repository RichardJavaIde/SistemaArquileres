// src/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  function linkClass(href: string) {
    const isActive = pathname === href;
    return [
      "text-sm font-medium px-3 py-2 rounded-full transition-colors duration-150 border",
      isActive
        ? "text-gray-900 border-gray-300 bg-gray-100"
        : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100",
    ].join(" ");
  }

  const isStaff = session && ["owner", "admin"].includes((session.user as any).role);

  const navLinks = [
    { href: "/dashboard/owner", label: "Resumen" },
    { href: "/dashboard/owner/properties", label: "Inmuebles" },
    { href: "/dashboard/owner/contracts", label: "Contratos" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
          Rentia
        </Link>

        {session && (
          <>
            <div className="hidden md:flex items-center gap-2">
              {isStaff &&
                navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                    {link.label}
                  </Link>
                ))}
              <span className="text-sm text-gray-400 mx-2">|</span>
              <span className="text-sm text-gray-500">{session.user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors duration-150 ml-2"
              >
                Salir
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </>
        )}
      </div>

      {session && menuOpen && (
        <div className="md:hidden mt-3 pb-2 flex flex-col gap-1">
          {isStaff &&
            navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          <span className="text-sm text-gray-500 px-3 py-2">{session.user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors duration-150 w-fit"
          >
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}