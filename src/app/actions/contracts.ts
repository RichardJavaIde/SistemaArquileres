// src/app/actions/contracts.ts
"use server";

import { db } from "@/db";
import { contracts, properties } from "@/db/schema";
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
    // Verificar que el inmueble no tenga ya un contrato activo
  const [existingActive] = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.propertyId, propertyId), eq(contracts.status, "active")));

  if (existingActive) {
    return { error: "Este inmueble ya tiene un contrato activo" };
  }

  revalidatePath("/dashboard/owner/contracts");
  return { success: true, contract: newContract };
}