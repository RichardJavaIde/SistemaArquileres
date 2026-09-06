// src/app/dashboard/owner/properties/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/actions/properties";

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
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>Nuevo inmueble</h1>
      <input
        placeholder="Dirección"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }}>
        <option value="house">Casa</option>
        <option value="apartment">Apartamento</option>
        <option value="land">Terreno</option>
        <option value="commercial">Local comercial</option>
      </select>
      <input
        placeholder="Precio mensual"
        value={monthlyPrice}
        onChange={(e) => setMonthlyPrice(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={handleSubmit}>Crear inmueble</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}