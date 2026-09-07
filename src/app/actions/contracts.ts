// src/app/actions/contracts.ts
"use server";

import { db } from "@/db";
import { contracts, properties,payments  } from "@/db/schema";
import { createContractSchema } from "@/validators/contract";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0]; // formato "YYYY-MM-DD" que espera la columna date
}

export async function createContract(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para crear contratos" };
  }

  const validation = createContractSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { propertyId, tenantId, startDate, months, monthlyRent } = validation.data;

  // Verificar que el inmueble sea del owner que hace la petición (seguridad extra)
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, session.user.id)));

  if (!property) {
    return { error: "Ese inmueble no existe o no te pertenece" };
  }

  const endDate = addMonths(startDate, months);

  try {
    const [newContract] = await db
      .insert(contracts)
      .values({
        propertyId,
        tenantId,
        startDate,
        endDate,
        durationMonths: months,
        monthlyRent: monthlyRent.toString(),
      })
      .returning();

    revalidatePath("/dashboard/owner/contracts");
    return { success: true, contract: newContract };
  } catch (err: any) {
    if (err.code === "23505") {
      // Código estándar de Postgres para "violación de restricción única"
      return { error: "Este inmueble ya tiene un contrato activo" };
    }
    throw err; // cualquier otro error, lo dejamos propagar (no lo escondemos)
  }
}

export async function cancelContract(contractId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para cancelar contratos" };
  }

  // Verificar que el contrato pertenezca a un inmueble de este owner
  const [contract] = await db
    .select({ id: contracts.id, ownerId: properties.ownerId })
    .from(contracts)
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .where(eq(contracts.id, contractId));

  if (!contract || contract.ownerId !== session.user.id) {
    return { error: "Ese contrato no existe o no te pertenece" };
  }

  // Verificar que no tenga pagos ya realizados
  const [paidPayment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.contractId, contractId), eq(payments.status, "paid")));

  if (paidPayment) {
    return { error: "No puedes cancelar un contrato que ya tiene pagos realizados" };
  }

  await db.update(contracts).set({ status: "cancelled" }).where(eq(contracts.id, contractId));

  revalidatePath("/dashboard/owner/contracts");
  return { success: true };
}
