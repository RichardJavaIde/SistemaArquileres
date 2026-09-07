// src/app/dashboard/owner/contracts/page.tsx
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CancelButton } from "./CancelButton";
import { eq } from "drizzle-orm";
import { contracts } from "@/db/schema";

export default async function ContractsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  const allContracts = await db.query.contracts.findMany({
    where: eq(contracts.status, "active"), // solo los activos
  with: {
    property: true,
    tenant: true,
    },
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Contratos</h1>
      <Link href="/dashboard/owner/contracts/new">+ Nuevo contrato</Link>
      <ul>
        {allContracts.map((c) => (
          <li key={c.id}>
             {c.property.address} — inquilino: {c.tenant.name} — ${c.monthlyRent}/mes ({c.startDate} a {c.endDate})
                <CancelButton contractId={c.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}