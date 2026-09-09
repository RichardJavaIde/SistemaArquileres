// src/app/dashboard/owner/contracts/[id]/edit/page.tsx
import { db } from "@/db";
import { properties, user, contracts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, and, ne, notInArray } from "drizzle-orm";
import { EditContractForm } from "./EditContractForm";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, id),
    with: { property: true },
  });

  if (!contract || contract.property.ownerId !== session.user.id) notFound();

  // Mismas listas que en "crear", pero incluyendo también el inmueble actual del contrato
  // (aunque ya esté "alquilado", porque es el que este contrato ya está usando)
  const activeContracts = await db
  .select({ propertyId: contracts.propertyId })
  .from(contracts)
  .where(and(eq(contracts.status, "active"), ne(contracts.id, id)));

const rentedIds = activeContracts.map((c) => c.propertyId);

const myProperties = await db
  .select()
  .from(properties)
  .where(
    rentedIds.length > 0
      ? and(eq(properties.ownerId, session.user.id), notInArray(properties.id, rentedIds))
      : eq(properties.ownerId, session.user.id)
  );

  const tenants = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.role as any, "tenant"));

  return (
    <div style={{ padding: 40 }}>
      <h1>Editar contrato</h1>
      <EditContractForm contract={contract} properties={myProperties} tenants={tenants} />
    </div>
  );
}