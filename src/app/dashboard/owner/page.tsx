// src/app/dashboard/owner/page.tsx
import { db } from "@/db";
import { properties, contracts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { cardClass, titleClass, buttonPrimaryClass } from "@/lib/styles";

export default async function OwnerDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  // El owner ve el resumen de TODO el sistema (no solo lo que administra él),
  // así que ya no filtramos por ownerId — solo excluimos inmuebles eliminados.
  const allProperties = await db.select().from(properties).where(eq(properties.isActive, true));

  const activeContracts = await db.query.contracts.findMany({
    where: eq(contracts.status, "active"),
    with: { property: true },
  });

  // Excluimos contratos de inmuebles ya eliminados (isActive: false), para que
  // "Alquilados" no cuente inmuebles que ya no existen (y "Disponibles" no dé negativo).
  const activePropertyContracts = activeContracts.filter((c) => c.property.isActive);

  const totalProperties = allProperties.length;
  const rentedCount = activePropertyContracts.length;
  const availableCount = totalProperties - rentedCount;
  const monthlyIncome = activePropertyContracts.reduce((sum, c) => sum + Number(c.monthlyRent), 0);

  const stats = [
    { label: "Inmuebles totales", value: totalProperties, href: "/dashboard/owner/properties" },
    { label: "Alquilados", value: rentedCount, href: "/dashboard/owner/contracts" },
    { label: "Disponibles", value: availableCount, href: "/dashboard/owner/properties" },
    { label: "Ingreso mensual", value: `$${monthlyIncome.toLocaleString()}` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className={titleClass}>Resumen</h1>
        <span className="text-sm text-gray-500">Hola, {session.user.name}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) =>
          s.href ? (
            <Link key={s.label} href={s.href} className={`${cardClass} block hover:border-blue-300 hover:shadow-md transition-shadow duration-150`}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </Link>
          ) : (
            <div key={s.label} className={cardClass}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          )
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/owner/properties" className={buttonPrimaryClass}>
          Ver inmuebles
        </Link>
        <Link href="/dashboard/owner/contracts" className={buttonPrimaryClass}>
          Ver contratos
        </Link>
      </div>
    </div>
  );
}