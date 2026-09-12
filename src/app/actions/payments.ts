// src/app/actions/payments.ts
"use server";

import { db } from "@/db";
import { payments, contracts, properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getPaymentWithOwnership(paymentId: string, ownerId: string) {
  const [payment] = await db
    .select({
      id: payments.id,
      contractId: payments.contractId,
      status: payments.status,
      dueDate: payments.dueDate,
      propertyOwnerId: properties.ownerId,
    })
    .from(payments)
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .where(eq(payments.id, paymentId));

  if (!payment || payment.propertyOwnerId !== ownerId) return null;
  return payment;
}

export async function markPaymentAsPaid(paymentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para registrar pagos" };
  }

  const payment = await getPaymentWithOwnership(paymentId, session.user.id);
  if (!payment) return { error: "Ese pago no existe o no te pertenece" };
  if (payment.status === "paid") return { error: "Este pago ya estaba registrado como pagado" };

  // Buscar la cuota más antigua NO pagada de este contrato
  const [earliestUnpaid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.contractId, payment.contractId), eq(payments.status, "pending")))
    .orderBy(asc(payments.dueDate))
    .limit(1);

  if (!earliestUnpaid || earliestUnpaid.id !== paymentId) {
    return { error: "Debes pagar las cuotas en orden. Hay un pago anterior sin registrar." };
  }

  await db
    .update(payments)
    .set({ status: "paid", paidDate: new Date().toISOString().split("T")[0] })
    .where(eq(payments.id, paymentId));

  revalidatePath("/dashboard/owner/contracts");
  return { success: true };
}

export async function undoPayment(paymentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para deshacer pagos" };
  }

  const payment = await getPaymentWithOwnership(paymentId, session.user.id);
  if (!payment) return { error: "Ese pago no existe o no te pertenece" };
  if (payment.status !== "paid") return { error: "Este pago no está marcado como pagado" };

  // Buscar el pago PAGADO más reciente de este contrato (por fecha de vencimiento)
  const [latestPaid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.contractId, payment.contractId), eq(payments.status, "paid")))
    .orderBy(desc(payments.dueDate))
    .limit(1);

  if (!latestPaid || latestPaid.id !== paymentId) {
    return { error: "Solo puedes deshacer el pago más reciente" };
  }

  await db
    .update(payments)
    .set({ status: "pending", paidDate: null })
    .where(eq(payments.id, paymentId));

  revalidatePath("/dashboard/owner/contracts");
  return { success: true };
}