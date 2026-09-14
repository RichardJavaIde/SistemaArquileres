// src/app/dashboard/owner/contracts/CancelButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelContract } from "@/app/actions/contracts";
import { buttonDangerClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

export function CancelButton({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar este contrato?")) return;
    setLoading(true);
    const result = await cancelContract(contractId);
    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }
    showToast("Contrato cancelado");
    router.refresh();
  }

  return (
    <button onClick={handleCancel} disabled={loading} className={buttonDangerClass}>
      {loading ? "..." : "Cancelar"}
    </button>
  );
}