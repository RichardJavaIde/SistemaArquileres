// src/app/dashboard/admin/users/ResetStaffPasswordButton.tsx
"use client";

import { useState } from "react";
import { resetStaffPassword } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { buttonNeutralClass } from "@/lib/styles";

export function ResetStaffPasswordButton({ userId }: { userId: string }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const newPassword = prompt("Escribe la nueva contraseña temporal (mínimo 8 caracteres):");
    if (!newPassword) return;

    setLoading(true);
    const result = await resetStaffPassword(userId, { newPassword });
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