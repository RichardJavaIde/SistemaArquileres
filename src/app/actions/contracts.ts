// src/app/actions/contracts.ts
"use server";

import { db } from "@/db";
import { contracts, properties,payments  } from "@/db/schema";
import { createContractSchema } from "@/validators/contract";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";


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

  // Cualquier owner/admin puede crear un contrato sobre cualquier inmueble,
  // así que ya no filtramos por ownerId — solo confirmamos que el inmueble exista.
  const endDate = addMonths(startDate, months);
  const contractId = randomUUID(); // generamos el id nosotros, antes de insertar
  const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));

  if (!property) {
    return { error: "Ese inmueble no existe" };
  }

  const paymentRows = Array.from({ length: months }, (_, i) => ({
    contractId,
    amount: monthlyRent.toString(),
    dueDate: addMonths(startDate, i),
    status: "pending" as const,
  }));

  try {
    const [[newContract]] = await db.batch([
      db.insert(contracts).values({
        id: contractId,
        propertyId,
        tenantId,
        startDate,
        endDate,
        durationMonths: months,
        monthlyRent: monthlyRent.toString(),
      }).returning(),
      db.insert(payments).values(paymentRows),
    ]);

    revalidatePath("/dashboard/owner/contracts");
    return { success: true, contract: newContract };
  } catch (err: any) {
    if (err.code === "23505") {
      return { error: "Este inmueble ya tiene un contrato activo" };
    }
    throw err;
  }
}

export async function cancelContract(contractId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para cancelar contratos" };
  }

  // Cualquier owner/admin puede cancelar cualquier contrato, así que ya no
  // filtramos por ownerId — solo confirmamos que el contrato exista.
  const [contract] = await db.select({ id: contracts.id }).from(contracts).where(eq(contracts.id, contractId));

  if (!contract) {
    return { error: "Ese contrato no existe" };
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

export async function updateContract(contractId: string, input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para editar contratos" };
  }

  // Cualquier owner/admin puede editar cualquier contrato, así que ya no
  // filtramos por ownerId — solo confirmamos que el contrato exista.
  const [existing] = await db.select({ id: contracts.id }).from(contracts).where(eq(contracts.id, contractId));

  if (!existing) {
    return { error: "Ese contrato no existe" };
  }

  // Bloquear edición si ya tiene algún pago registrado
  const [anyPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.contractId, contractId));

  if (anyPayment) {
    return { error: "No puedes editar un contrato que ya tiene pagos registrados" };
  }

  const validation = createContractSchema.safeParse(input); // reutilizamos el mismo schema de crear
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { propertyId, tenantId, startDate, months, monthlyRent } = validation.data;

  // Si cambió el inmueble, confirmar que el NUEVO exista
  const [newProperty] = await db.select().from(properties).where(eq(properties.id, propertyId));

  if (!newProperty) {
    return { error: "Ese inmueble no existe" };
  }

  const endDate = addMonths(startDate, months);

  try {
    await db
      .update(contracts)
      .set({
        propertyId,
        tenantId,
        startDate,
        endDate,
        durationMonths: months,
        monthlyRent: monthlyRent.toString(),
      })
      .where(eq(contracts.id, contractId));

    revalidatePath("/dashboard/owner/contracts");
    return { success: true };
  } catch (err: any) {
    if (err.code === "23505") {
      return { error: "El inmueble seleccionado ya tiene otro contrato activo" };
    }
    throw err;
  }
}