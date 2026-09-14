// src/app/dashboard/admin/users/[id]/edit/EditStaffForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStaffUser } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

type Props = { staffUser: { id: string; name: string; role: string } };

export function EditStaffForm({ staffUser }: Props) {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState(staffUser.name);
  const [role, setRole] = useState(staffUser.role);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await updateStaffUser(staffUser.id, { name, role });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Cambios guardados");
    router.push("/dashboard/admin/users");
  }

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className={inputClass} />
      <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
        <option value="owner">Owner (dueño de inmuebles)</option>
        <option value="admin">Administrador</option>
      </select>
      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}