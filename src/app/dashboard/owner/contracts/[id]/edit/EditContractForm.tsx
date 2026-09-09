// src/app/dashboard/owner/contracts/[id]/edit/EditContractForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContract } from "@/app/actions/contracts";
import { inputClass, labelClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

type Props = {
  contract: { id: string; propertyId: string; tenantId: string; startDate: string; durationMonths: number; monthlyRent: string };
  properties: { id: string; address: string; monthlyPrice: string }[];
  tenants: { id: string; name: string; email: string }[];
};

export function EditContractForm({ contract, properties, tenants }: Props) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(contract.propertyId);
  const [tenantId, setTenantId] = useState(contract.tenantId);
  const [startDate, setStartDate] = useState(contract.startDate);
  const [months, setMonths] = useState(String(contract.durationMonths));
  const [monthlyRent, setMonthlyRent] = useState(contract.monthlyRent);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await updateContract(contract.id, { propertyId, tenantId, startDate, months, monthlyRent });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard/owner/contracts");
  }

  return (
    <div>
      {properties.length === 0 ? (
        <p className={errorTextClass}>No hay inmuebles disponibles para asignar.</p>
      ) : (
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputClass}>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.address}</option>
          ))}
        </select>
      )}

      <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className={inputClass}>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
        ))}
      </select>

      <label className={labelClass}>Fecha de inicio</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className={inputClass}
      />

      <label className={labelClass}>Duración (meses)</label>
      <input
        type="number"
        min={1}
        max={60}
        value={months}
        onChange={(e) => setMonths(e.target.value)}
        className={inputClass}
      />

      <input
        value={monthlyRent}
        onChange={(e) => setMonthlyRent(e.target.value)}
        className={inputClass}
      />

      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}