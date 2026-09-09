// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
        Rentia
      </Link>

      {session && (
        <div className="flex items-center gap-2">
          {["owner", "admin"].includes((session.user as any).role) && (
            <>
              <Link
                href="/dashboard/owner/properties"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors duration-150"
              >
                Inmuebles
              </Link>
              <Link
                href="/dashboard/owner/contracts"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors duration-150"
              >
                Contratos
              </Link>
            </>
          )}

          <span className="text-sm text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-500">{session.user.name}</span>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors duration-150 ml-2"
          >
            Salir
          </button>
        </div>
      )}
    </div>
  </nav>);
}