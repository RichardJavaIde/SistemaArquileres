// src/app/dashboard/owner/properties/page.tsx
import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function PropertiesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = (session.user as any).role;
  if (role !== "owner" && role !== "admin") redirect("/");

  const myProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.ownerId, session.user.id));

  return (
    <div style={{ padding: 40 }}>
      <h1>Mis inmuebles</h1>
      <Link href="/dashboard/owner/properties/new">+ Nuevo inmueble</Link>
      <ul>
        {myProperties.map((p) => (
          <li key={p.id}>
            {p.address} — {p.type} — ${p.monthlyPrice}/mes
          </li>
        ))}
      </ul>
      {myProperties.length === 0 && <p>Todavía no tienes inmuebles registrados.</p>}
    </div>
  );
}