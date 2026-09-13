// src/app/dashboard/owner/tenants/ResetPasswordButton.tsx
"use client";

import { useState } from "react";
import { resetTenantPassword } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { buttonNeutralClass } from "@/lib/styles";

export function ResetPasswordButton({ tenantId }: { tenantId: string }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const newPassword = prompt("Escribe la nueva contraseña temporal (mínimo 8 caracteres):");
    if (!newPassword) return;

    setLoading(true);
    const result = await resetTenantPassword(tenantId, { newPassword });
    setLoading(false);

    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    showToast("Contraseña actualizada correctamente");
  }

  return (
    <button onClick={handleClick} disabled={loading} className={buttonNeutralClass}>
      {loading ? "..." : "Resetear clave"}
    </button>
  );
}