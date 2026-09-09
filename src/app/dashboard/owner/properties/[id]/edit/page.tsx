// src/app/dashboard/owner/properties/[id]/edit/page.tsx
import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { EditPropertyForm } from "./EditPropertyForm";
import { titleClass } from "@/lib/styles";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, session.user.id)));

  if (!property) notFound();

  return (
    <div className="max-w-md">
      <h1 className={`${titleClass} mb-6`}>Editar inmueble</h1>
      <EditPropertyForm property={property} />
    </div>
  );
}