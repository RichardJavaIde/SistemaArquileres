// src/app/dashboard/owner/tenants/new/TenantForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTenant } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

export function TenantForm() {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await createTenant({ name, email, password });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Inquilino registrado correctamente");
    router.push("/dashboard/owner/contracts/new");
  }

  return (
    <div>
      <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      <input placeholder="Contraseña temporal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Registrando..." : "Registrar inquilino"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}