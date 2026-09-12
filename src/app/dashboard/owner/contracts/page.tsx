// src/app/dashboard/owner/contracts/page.tsx
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CancelButton } from "./CancelButton";
import { eq } from "drizzle-orm";
import { contracts } from "@/db/schema";
import { buttonPrimaryClass, buttonEditClass, cardClass, pageHeaderClass, titleClass,buttonNeutralClass  } from "@/lib/styles";

export default async function ContractsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  const allContracts = await db.query.contracts.findMany({
    where: eq(contracts.status, "active"), // solo los activos
  with: {
    property: true,
    tenant: true,
    },
  });

  return (
     <div>
    <div className={pageHeaderClass}>
      <h1 className={titleClass}>Contratos</h1>
      <Link href="/dashboard/owner/contracts/new" className={buttonPrimaryClass}>
        + Nuevo contrato
      </Link>
    </div>

    {allContracts.length === 0 ? (
      <p className="text-gray-500">Todavía no tienes contratos registrados.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allContracts.map((c) => (
          <div key={c.id} className={cardClass}>
            <p className="font-medium text-gray-900">{c.property.address}</p>
            <p className="text-sm text-gray-500">Inquilino: {c.tenant.name}</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">${c.monthlyRent}/mes</p>
            <p className="text-xs text-gray-400 mt-1">
              {c.startDate} a {c.endDate}
            </p>
            <div className="flex gap-3 mt-3 text-sm">
              <Link href={`/dashboard/owner/contracts/${c.id}/edit`} className={buttonEditClass}>
                Editar
              </Link>
              <Link href={`/dashboard/owner/contracts/${c.id}`} className={buttonNeutralClass}>
  Ver pagos
</Link>
              <CancelButton contractId={c.id} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  );
}