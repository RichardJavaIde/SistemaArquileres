// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/validators/auth";
import { inputClass, buttonPrimaryClass, errorTextClass } from "@/lib/styles";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function goToDashboard(role: string) {
    if (role === "tenant") router.push("/dashboard/tenant");
    else router.push("/dashboard/owner");
  }

  useEffect(() => {
    if (session) goToDashboard((session.user as any).role);
  }, [session]);

  async function handleSignIn() {
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    const { data, error: authError } = await authClient.signIn.email(validation.data);
    if (authError) {
      setError(authError.message ?? "Credenciales inválidas");
      return;
    }
    goToDashboard((data.user as any).role);
  }

  if (isPending || session) {
    return <p className="text-gray-500">Cargando...</p>;
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Rentia</h1>
      <p className="text-sm text-gray-500 mb-6">Inicia sesión para continuar</p>

      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />

      <button onClick={handleSignIn} className={buttonPrimaryClass}>
        Iniciar sesión
      </button>

      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}