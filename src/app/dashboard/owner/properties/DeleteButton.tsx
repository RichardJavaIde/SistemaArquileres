// src/app/dashboard/owner/properties/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deactivateProperty } from "@/app/actions/properties";
import { buttonDangerClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

export function DeleteButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este inmueble?")) return;
    setLoading(true);
    const result = await deactivateProperty(propertyId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Inmueble eliminado")
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={handleDelete} disabled={loading} className={buttonDangerClass}>
        {loading ? "..." : "Eliminar"}
      </button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </span>
  );
}