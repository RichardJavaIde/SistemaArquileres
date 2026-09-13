// src/app/dashboard/owner/tenants/DisableTenantButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { disableTenant } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { buttonDangerClass } from "@/lib/styles";

export function DisableTenantButton({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("¿Seguro que quieres deshabilitar este inquilino?")) return;
    setLoading(true);
    const result = await disableTenant(tenantId);
    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }
    showToast("Inquilino deshabilitado");
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className={buttonDangerClass}>
      {loading ? "..." : "Deshabilitar"}
    </button>
  );
}