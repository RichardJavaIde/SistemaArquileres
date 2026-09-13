// src/app/not-found.tsx
import Link from "next/link";
import { buttonPrimaryClass } from "@/lib/styles";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">No encontrado</h1>
      <p className="text-gray-500 mb-6">Lo que buscas no existe o no tienes acceso a ello.</p>
      <Link href="/" className={buttonPrimaryClass}>
        Volver al inicio
      </Link>
    </div>
  );
}