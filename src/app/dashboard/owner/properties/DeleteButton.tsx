// src/app/dashboard/owner/properties/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deactivateProperty } from "@/app/actions/properties";
import { buttonDangerClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

export function DeleteButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este inmueble?")) return;
    setLoading(true);
    const result = await deactivateProperty(propertyId);
    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }
    showToast("Inmueble eliminado");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className={buttonDangerClass}>
      {loading ? "..." : "Eliminar"}
    </button>
  );
}