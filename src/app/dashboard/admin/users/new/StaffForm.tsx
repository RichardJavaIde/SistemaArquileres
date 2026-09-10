// src/app/dashboard/admin/users/new/StaffForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaffUser } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

export function StaffForm() {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await createStaffUser({ name, email, password, role });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    showToast("Usuario creado correctamente");
    router.push("/dashboard/owner");
  }

  return (
    <div>
      <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
        <option value="owner">Owner (dueño de inmuebles)</option>
        <option value="admin">Administrador</option>
      </select>
      <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClass}>
        {loading ? "Creando..." : "Crear usuario"}
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}