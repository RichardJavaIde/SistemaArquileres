// src/app/dashboard/owner/properties/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/actions/properties";
import { inputClass, buttonPrimaryClass } from "@/lib/styles";

export default function NewPropertyPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [type, setType] = useState("house");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    const result = await createProperty({ address, type, monthlyPrice });

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/dashboard/owner/properties"); // redirige al listado
  }

  return (
     <div className="max-w-md">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo inmueble</h1>
    <input
      placeholder="Dirección"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      className={inputClass}
    />
    <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
      <option value="house">Casa</option>
      <option value="apartment">Apartamento</option>
      <option value="land">Terreno</option>
      <option value="commercial">Local comercial</option>
    </select>
    <input
      placeholder="Precio mensual"
      value={monthlyPrice}
      onChange={(e) => setMonthlyPrice(e.target.value)}
      className={inputClass}
    />
    <button onClick={handleSubmit} className={buttonPrimaryClass}>
      Crear inmueble
    </button>
    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
  </div>
  );
}