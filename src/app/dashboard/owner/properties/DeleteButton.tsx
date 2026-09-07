// src/app/dashboard/owner/properties/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deactivateProperty } from "@/app/actions/properties";

export function DeleteButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este inmueble?")) return;
    setLoading(true);
    const result = await deactivateProperty(propertyId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh(); // vuelve a pedir los datos del servidor sin recargar toda la página
  }

  return (
    <span>
      <button onClick={handleDelete} disabled={loading} style={{ marginLeft: 8, color: "red" }}>
        {loading ? "..." : "Eliminar"}
      </button>
      {error && <span style={{ color: "red", marginLeft: 8, fontSize: 12 }}>{error}</span>}
    </span>
  );
}