// src/app/dashboard/owner/properties/page.tsx
import { db } from "@/db";
import { properties, contracts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";
import { buttonPrimaryClass, buttonEditClass, cardClass, pageHeaderClass, titleClass } from "@/lib/styles";


export default async function PropertiesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = (session.user as any).role;
  if (role !== "owner" && role !== "admin") redirect("/");

  const myProperties = await db
  .select()
  .from(properties)
  .where(and(eq(properties.ownerId, session.user.id), eq(properties.isActive, true)));

  // Averiguamos cuáles de estos inmuebles tienen un contrato activo en este momento,
  // para poder mostrar la etiqueta "Alquilado" / "No alquilado" sin ir a otra pantalla.
  const propertyIds = myProperties.map((p) => p.id);
  const activeContracts = propertyIds.length
    ? await db
        .select({ propertyId: contracts.propertyId })
        .from(contracts)
        .where(and(inArray(contracts.propertyId, propertyIds), eq(contracts.status, "active")))
    : [];
  const rentedPropertyIds = new Set(activeContracts.map((c) => c.propertyId));

  return (
     <div>
    <div className={pageHeaderClass}>
      <h1 className={titleClass}>Mis inmuebles</h1>
      <Link href="/dashboard/owner/properties/new" className={buttonPrimaryClass}>
        + Nuevo inmueble
      </Link>
    </div>

    {myProperties.length === 0 ? (
      <p className="text-gray-500">Todavía no tienes inmuebles registrados.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myProperties.map((p) => {
          const isRented = rentedPropertyIds.has(p.id);
          return (
            <div key={p.id} className={cardClass}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{p.address}</p>
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    isRented ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isRented ? "Alquilado" : "No alquilado"}
                </span>
              </div>
              <p className="text-sm text-gray-500 capitalize">{p.type}</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">${p.monthlyPrice}/mes</p>
              <div className="flex gap-3 mt-3 text-sm">
                <Link href={`/dashboard/owner/properties/${p.id}/edit`} className={buttonEditClass}>
                  Editar
                </Link>
                <DeleteButton propertyId={p.id} />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
}