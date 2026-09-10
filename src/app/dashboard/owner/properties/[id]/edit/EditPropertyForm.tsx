// src/app/dashboard/owner/properties/[id]/edit/EditPropertyForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProperty } from "@/app/actions/properties";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";
import { useToast } from "@/components/Toast";

type Props = {
  property: { id: string; address: string; type: string; monthlyPrice: string };
};

export function EditPropertyForm({ property }: Props) {
  const router = useRouter();
  const [address, setAddress] = useState(property.address);
  const [type, setType] = useState(property.type);
  const [monthlyPrice, setMonthlyPrice] = useState(property.monthlyPrice);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await updateProperty(property.id, { address, type, monthlyPrice });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Cambios guardados")
    router.push("/dashboard/owner/properties");
  }

  return (
    <div>
      <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
        <option value="house">Casa</option>
        <option value="apartment">Apartamento</option>
        <option value="land">Terreno</option>
        <option value="commercial">Local comercial</option>
      </select>
      <input value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} className={inputClass} />
      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}