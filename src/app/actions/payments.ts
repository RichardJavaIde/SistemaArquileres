// src/app/actions/payments.ts
"use server";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Cualquier owner/admin puede gestionar cualquier pago, así que ya no
// verificamos que el inmueble le pertenezca a este usuario — solo que el
// pago exista.
async function getPayment(paymentId: string) {
  const [payment] = await db
    .select({
      id: payments.id,
      contractId: payments.contractId,
      status: payments.status,
      dueDate: payments.dueDate,
    })
    .from(payments)
    .where(eq(payments.id, paymentId));

  return payment ?? null;
}

export async function markPaymentAsPaid(paymentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para registrar pagos" };
  }

  const payment = await getPayment(paymentId);
  if (!payment) return { error: "Ese pago no existe" };
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

  const payment = await getPayment(paymentId);
  if (!payment) return { error: "Ese pago no existe" };
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