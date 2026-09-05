// src/app/page.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<string>("");

  async function handleSignUp() {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      setResult(`Error: ${error.message}`);
    } else {
      setResult(`¡Usuario creado! ID: ${data.user.id}`);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>Registro de prueba</h1>
      <input
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={handleSignUp}>Crear cuenta</button>
      <p>{result}</p>
    </div>
  );
}