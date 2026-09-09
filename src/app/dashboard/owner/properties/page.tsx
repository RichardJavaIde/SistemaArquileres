// src/app/dashboard/owner/properties/page.tsx
import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
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
        {myProperties.map((p) => (
          <div key={p.id} className={cardClass}>
            <p className="font-medium text-gray-900">{p.address}</p>
            <p className="text-sm text-gray-500 capitalize">{p.type}</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">${p.monthlyPrice}/mes</p>
            <div className="flex gap-3 mt-3 text-sm">
              <Link href={`/dashboard/owner/properties/${p.id}/edit`} className={buttonEditClass}>
                Editar
              </Link>
              <DeleteButton propertyId={p.id} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  );
}