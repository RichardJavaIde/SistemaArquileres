// src/app/dashboard/tenant/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TenantDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/");
  if ((session.user as any).role !== "tenant") redirect("/"); // no es inquilino, fuera

  return (
    <div style={{ padding: 40 }}>
      <h1>Hola, {session.user.name}</h1>
      <p>Aquí verás tus pagos pendientes (lo construimos en la Fase 6).</p>
    </div>
  );
}