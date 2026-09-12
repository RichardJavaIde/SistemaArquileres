// src/app/dashboard/tenant/page.tsx
import { db } from "@/db";
import { contracts, payments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { cardClass, titleClass } from "@/lib/styles";

export default async function TenantDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if ((session.user as any).role !== "tenant") redirect("/");

  // Todos los contratos activos de este inquilino, con sus pagos
  const myContracts = await db.query.contracts.findMany({
    where: eq(contracts.tenantId, session.user.id),
    with: {
      property: true,
      payments: {
        orderBy: [asc(payments.dueDate)],
      },
    },
  });

  function getEffectiveStatus(payment: { status: string; dueDate: string }): "pending" | "paid" | "late" {
    if (payment.status === "paid") return "paid";
    return new Date(payment.dueDate) < new Date() ? "late" : "pending";
  }

  const statusLabel: Record<string, string> = { pending: "Pendiente", paid: "Pagado", late: "Atrasado" };
  const statusColor: Record<string, string> = { pending: "text-gray-500", paid: "text-green-600", late: "text-red-600" };

  return (
    <div>
      <h1 className={`${titleClass} mb-6`}>Hola, {session.user.name}</h1>

      {myContracts.length === 0 && (
        <p className="text-gray-500">No tienes contratos de alquiler activos.</p>
      )}

      {myContracts.map((contract) => (
        <div key={contract.id} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{contract.property.address}</h2>
          <div className="space-y-3">
            {contract.payments.map((p) => {
              const effectiveStatus = getEffectiveStatus(p);
              return (
                <div key={p.id} className={`${cardClass} flex items-center justify-between`}>
                  <div>
                    <p className="font-medium text-gray-900">Vence: {p.dueDate}</p>
                    <p className={`text-sm font-medium ${statusColor[effectiveStatus]}`}>
                      {statusLabel[effectiveStatus]}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">${p.amount}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}