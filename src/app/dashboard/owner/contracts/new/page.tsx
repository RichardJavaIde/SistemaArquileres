import { db } from "@/db";
import { properties, user, contracts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, notInArray } from "drizzle-orm";
import { ContractForm } from "./ContractForm";

export default async function NewContractPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  // 1. Averiguamos qué inmuebles YA tienen un contrato activo
  const activeContracts = await db
    .select({ propertyId: contracts.propertyId })
    .from(contracts)
    .where(eq(contracts.status, "active"));

  const rentedIds = activeContracts.map((c) => c.propertyId);

  // 2. Traemos solo los inmuebles del owner que NO estén en esa lista
  const availableProperties = await db
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
      <h1>Nuevo contrato</h1>
      <ContractForm properties={availableProperties} tenants={tenants} />
    </div>
  );
}