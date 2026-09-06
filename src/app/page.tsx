// src/app/page.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, signInSchema  } from "@/validators/auth";


export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState("");

  async function handleSignUp() {
   const validation = signUpSchema.safeParse({ name, email, password });

  if (!validation.success) {
    // .issues es un array de todos los errores encontrados
    setResult(`Error: ${validation.error.issues[0].message}`);
    return; // cortamos aquí, ni siquiera llamamos a Better Auth
  }

  const { data, error } = await authClient.signUp.email(validation.data);
  setResult(error ? `Error: ${error.message}` : `¡Cuenta creada! ID: ${data.user.id}`);
  }

  async function handleSignIn() {
    const validation = signInSchema.safeParse({ email, password });

  if (!validation.success) {
    setResult(`Error: ${validation.error.issues[0].message}`);
    return;
  }

  const { data, error } = await authClient.signIn.email(validation.data);
  setResult(error ? `Error: ${error.message}` : `¡Sesión iniciada! Bienvenido, ${data.user.name}`);
}

  async function handleSignOut() {
    await authClient.signOut();
    setResult("Sesión cerrada");
  }

  if (isPending) return <p style={{ padding: 40 }}>Cargando...</p>;

  // Si HAY sesión activa, mostramos datos del usuario y el botón de salir
  if (session) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Sesión activa</h1>
        <p>Nombre: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        <p>Rol: {(session.user as any).role}</p>
        <button onClick={handleSignOut}>Cerrar sesión</button>
      </div>
    );
  }

  // Si NO hay sesión, mostramos el formulario
  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>Registro / Login de prueba</h1>
      <input placeholder="Nombre (solo para registro)" value={name} onChange={(e) => setName(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />
      <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", marginBottom: 8, width: "100%" }} />
      <button onClick={handleSignUp}>Crear cuenta</button>
      <button onClick={handleSignIn} style={{ marginLeft: 8 }}>Iniciar sesión</button>
      <p>{result}</p>
    </div>
  );
}