// src/app/error.tsx
"use client";

import { buttonPrimaryClass } from "@/lib/styles";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
      <p className="text-gray-500 mb-6">Ocurrió un error inesperado. Puedes intentar de nuevo.</p>
      <button onClick={() => reset()} className={buttonPrimaryClass}>
        Reintentar
      </button>
    </div>
  );
}