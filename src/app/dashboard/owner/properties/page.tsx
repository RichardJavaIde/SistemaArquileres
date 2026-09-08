// src/app/dashboard/owner/properties/page.tsx
import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";

export default async function PropertiesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = (session.user as any).role;
  if (role !== "owner" && role !== "admin") redirect("/");

  const myProperties = await db
  .select()
  .from(properties)
  .where(and(eq(properties.ownerId, session.user.id), eq(properties.isActive, true)));

  return (
    <div style={{ padding: 40 }}>
      <h1>Mis inmuebles</h1>
      <Link href="/dashboard/owner/properties/new">+ Nuevo inmueble</Link>
      <ul>
        {myProperties.map((p) => (
          <li key={p.id}>
             {p.address} — {p.type} — ${p.monthlyPrice}/mes
            {" "}<Link href={`/dashboard/owner/properties/${p.id}/edit`}>Editar</Link>
            <DeleteButton propertyId={p.id} />
          </li>
        ))}
      </ul>
      {myProperties.length === 0 && <p>Todavía no tienes inmuebles registrados.</p>}
    </div>
  );
}