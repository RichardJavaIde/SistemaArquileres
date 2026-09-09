// src/app/dashboard/owner/contracts/[id]/edit/EditContractForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContract } from "@/app/actions/contracts";

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
    <div style={{ maxWidth: 400 }}>
     {properties.length === 0 ? (
  <p style={{ color: "red" }}>No hay inmuebles disponibles para asignar.</p>
) : (
  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }}>
    {properties.map((p) => (
      <option key={p.id} value={p.id}>{p.address}</option>
    ))}
  </select>
)}

      <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }}>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
        ))}
      </select>

      <label>Fecha de inicio</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />

      <label>Duración (meses)</label>
      <input type="number" min={1} max={60} value={months} onChange={(e) => setMonths(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />

      <input value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />

      <button onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}