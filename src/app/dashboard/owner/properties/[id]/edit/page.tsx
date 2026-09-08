// src/app/dashboard/owner/properties/[id]/edit/page.tsx
import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { EditPropertyForm } from "./EditPropertyForm";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // en Next.js reciente, params es una Promise
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, session.user.id)));

  if (!property) notFound(); // muestra la página 404 si no existe o no le pertenece

  return (
    <div style={{ padding: 40 }}>
      <h1>Editar inmueble</h1>
      <EditPropertyForm property={property} />
    </div>
  );
}