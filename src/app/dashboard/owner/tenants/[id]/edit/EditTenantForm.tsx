// src/app/dashboard/owner/tenants/[id]/edit/EditTenantForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTenant } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

type Props = { tenant: { id: string; name: string; phone: string | null; cedula: string | null } };

export function EditTenantForm({ tenant }: Props) {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState(tenant.name);
  const [phone, setPhone] = useState(tenant.phone ?? "");
  const [cedula, setCedula] = useState(tenant.cedula ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await updateTenant(tenant.id, { name, phone, cedula });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Cambios guardados");
    router.push("/dashboard/owner/tenants");
  }

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className={inputClass} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className={inputClass} />
      <input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Cédula" className={inputClass} />
      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}