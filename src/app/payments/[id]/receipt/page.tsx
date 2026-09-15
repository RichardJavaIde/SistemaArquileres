// src/app/payments/[id]/receipt/page.tsx
import { db } from "@/db";
import { payments, properties, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PrintButton } from "./PrintButton";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, id),
    with: {
      contract: {
        with: { property: true, tenant: true },
      },
    },
  });

  if (!payment || payment.status !== "paid") notFound();

  const { contract } = payment;
  // Cualquier owner/admin puede ver cualquier recibo, así que ya no exigimos
  // que el inmueble le pertenezca a este usuario en particular. El inquilino
  // del contrato también puede ver su propio recibo.
  const role = (session.user as any).role;
  const isStaff = role === "owner" || role === "admin";
  const isTenant = contract.tenantId === session.user.id;
  if (!isStaff && !isTenant) notFound();

  const [owner] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, contract.property.ownerId));
const typeLabel: Record<string, string> = {
  house: "Casa",
  apartment: "Apartamento",
  land: "Terreno",
  commercial: "Local comercial",
};
  return (
    <div className="flex flex-col items-center">
      <PrintButton />

      <div
        id="receipt-print"
        className="w-[80mm] bg-white text-black font-mono text-xs p-3 border border-gray-300 mt-4"
      >
        <p className="text-center font-bold text-sm">RENTIA</p>
        <p className="text-center">Comprobante de pago</p>
        <p className="text-center mb-2">--------------------------------</p>

        <p>Inquilino: {contract.tenant.name}</p>
        <p>Inmueble: {contract.property.address}</p>
        <p>Tipo: {typeLabel[contract.property.type]}</p>
        <p className="text-center font-bold text-sm mt-2">Comprobante # {payment.id.slice(0, 8)}</p>
        <p className="mt-2">--------------------------------</p>
        <p>Vencimiento: {payment.dueDate}</p>
        <p>Fecha de pago: {payment.paidDate}</p>
        <p className="mt-2">--------------------------------</p>

        <p className="text-center font-bold text-sm mt-2">TOTAL PAGADO</p>
        <p className="text-center font-bold text-base">${payment.amount}</p>

        <p className="text-center mt-4">¡Gracias por su pago!</p>
        
      </div>
    </div>
  );
}