// src/app/dashboard/owner/contracts/new/ContractForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/app/actions/contracts";
import { buttonPrimaryClass, inputClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

type Props = {
  properties: { id: string; address: string; monthlyPrice: string }[]; // agregamos monthlyPrice
  tenants: { id: string; name: string; email: string }[];
};

export function ContractForm({ properties, tenants }: Props) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [months, setMonths] = useState("12"); // 12 meses como default razonable
  const [monthlyRent, setMonthlyRent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();

   // Vista previa de la fecha de fin, solo para mostrar al usuario (el cálculo real y válido ocurre en el servidor)
  const previewEndDate = (() => {
    if (!startDate || !months) return null;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + Number(months));
    return date.toLocaleDateString();
  })();

  function handlePropertyChange(id: string) {
    setPropertyId(id);
    const selected = properties.find((p) => p.id === id);
    if (selected) setMonthlyRent(selected.monthlyPrice); // autocompleta, pero sigue editable
  }

  async function handleSubmit() {
    if (isSubmitting) return; // <-- evita doble clic mientras ya está procesando
    setIsSubmitting(true);
    setError("");
    const result = await createContract({ propertyId, tenantId, startDate, months, monthlyRent });
    if (result.error) {
      setError(result.error);
            setIsSubmitting(false); // solo desbloqueamos si hubo error; si hay éxito, navegamos y ya

      return;
    }
    showToast("Contrato creado correctamente")
    router.push("/dashboard/owner/contracts");
  }

  return (
     <div>
      <select value={propertyId} onChange={(e) => handlePropertyChange(e.target.value)} className={inputClass}>
        <option value="">-- Selecciona un inmueble --</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>{p.address}</option>
        ))}
      </select>

      <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className={inputClass}>
        <option value="">-- Selecciona un inquilino --</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className={inputClass}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">Duración (meses)</label>
      <input
        type="number"
        min={1}
        max={60}
        value={months}
        onChange={(e) => setMonths(e.target.value)}
        className={inputClass}
      />
      {previewEndDate && (
        <p className="text-xs text-gray-500 -mt-2 mb-3">Fecha de fin estimada: {previewEndDate}</p>
      )}

      <input
        placeholder="Monto mensual"
        value={monthlyRent}
        onChange={(e) => setMonthlyRent(e.target.value)}
        className={inputClass}
      />

      <button onClick={handleSubmit} disabled={isSubmitting} className={buttonPrimaryClass}>
        {isSubmitting ? "Creando..." : "Crear contrato"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
     
     
}