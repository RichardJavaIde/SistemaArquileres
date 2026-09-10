// src/app/dashboard/owner/contracts/CancelButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelContract } from "@/app/actions/contracts";
import { buttonDangerClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

export function CancelButton({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar este contrato?")) return;
    setLoading(true);
    const result = await cancelContract(contractId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Contrato cancelado")
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={handleCancel} disabled={loading} className={buttonDangerClass}>
        {loading ? "..." : "Cancelar"}
      </button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </span>
  );
}