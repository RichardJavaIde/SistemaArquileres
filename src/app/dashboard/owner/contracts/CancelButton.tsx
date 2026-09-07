// src/app/dashboard/owner/contracts/CancelButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelContract } from "@/app/actions/contracts";

export function CancelButton({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres eliminar este contrato?")) return;
    setLoading(true);
    const result = await cancelContract(contractId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh(); // vuelve a pedir los datos del servidor sin recargar toda la página
  }

  return (
    <span>
      <button onClick={handleCancel} disabled={loading} style={{ marginLeft: 8, color: "red" }}>
        {loading ? "..." : "Cancelar contrato"}
      </button>
      {error && <span style={{ color: "red", marginLeft: 8, fontSize: 12 }}>{error}</span>}
    </span>
  );
}