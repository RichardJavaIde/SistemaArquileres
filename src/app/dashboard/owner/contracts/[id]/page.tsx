// src/app/dashboard/owner/contracts/[id]/page.tsx
import { db } from "@/db";
import { contracts, payments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { cardClass, titleClass } from "@/lib/styles";
import { MarkPaidButton } from "./MarkPaidButton";


export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, id),
    with: { property: true, tenant: true },
  });

  if (!contract || contract.property.ownerId !== session.user.id) notFound();

  const contractPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.contractId, id))
    .orderBy(asc(payments.dueDate));

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    late: "Atrasado",
  };

  const statusColor: Record<string, string> = {
    pending: "text-gray-500",
    paid: "text-green-600",
    late: "text-red-600",
  };

  function getEffectiveStatus(payment: { status: string; dueDate: string }): "pending" | "paid" | "late" {
  if (payment.status === "paid") return "paid";
  const isOverdue = new Date(payment.dueDate) < new Date();
  return isOverdue ? "late" : "pending";
}

  return (
    <div>
      <h1 className={`${titleClass} mb-1`}>{contract.property.address}</h1>
      <p className="text-sm text-gray-500 mb-6">Inquilino: {contract.tenant.name}</p>

      <div className="space-y-3">
        {contractPayments.map((p) => {
  const effectiveStatus = getEffectiveStatus(p);
  return (
    <div key={p.id} className={`${cardClass} flex items-center justify-between`}>
      <div>
        <p className="font-medium text-gray-900">Vence: {p.dueDate}</p>
        <p className={`text-sm font-medium ${statusColor[effectiveStatus]}`}>{statusLabel[effectiveStatus]}</p>
      </div>
      <div className="flex items-center gap-3">
  <p className="font-semibold text-gray-900">${p.amount}</p>
  <MarkPaidButton paymentId={p.id} isPaid={p.status === "paid"} />
</div>
    </div>
  );
})}
      </div>
    </div>
  );
}