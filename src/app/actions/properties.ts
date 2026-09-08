// src/app/actions/properties.ts
"use server";

import { db } from "@/db";
import { properties, contracts } from "@/db/schema";
import { createPropertySchema } from "@/validators/property";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createProperty(input: unknown) {
  // 1. Verificar que hay una sesión activa
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Debes iniciar sesión" };
  }

  // 2. Verificar el rol — solo owner o admin pueden crear inmuebles
  const role = (session.user as any).role;
  if (role !== "owner" && role !== "admin") {
    return { error: "No tienes permiso para crear inmuebles" };
  }

  // 3. Validar los datos (NUNCA confiar en lo que llega del cliente)
  const validation = createPropertySchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 4. Insertar en la base de datos
  const [newProperty] = await db
    .insert(properties)
    .values({
      ...validation.data,
      monthlyPrice: validation.data.monthlyPrice.toString(), // numeric espera string en Drizzle
      ownerId: session.user.id,
    })
    .returning();

  // 5. Le dice a Next.js "la data de esta página cambió, refréscala"
  revalidatePath("/properties");

  
  return { success: true, property: newProperty };
}
export async function deactivateProperty(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Debes iniciar sesión" };

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, session.user.id)));

  if (!property) return { error: "Ese inmueble no existe o no te pertenece" };

  // Verificar que no tenga un contrato activo
  const [activeContract] = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.propertyId, propertyId), eq(contracts.status, "active")));

  if (activeContract) {
    return { error: "No puedes eliminar un inmueble con un contrato activo" };
  }

  await db.update(properties).set({ isActive: false }).where(eq(properties.id, propertyId));

  revalidatePath("/dashboard/owner/properties");
  return { success: true };
}

export async function updateProperty(propertyId: string, input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Debes iniciar sesión" };

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, session.user.id)));

  if (!property) return { error: "Ese inmueble no existe o no te pertenece" };

  const validation = createPropertySchema.safeParse(input); // reutilizamos el mismo schema de Zod de crear
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  await db
    .update(properties)
    .set({
      ...validation.data,
      monthlyPrice: validation.data.monthlyPrice.toString(),
    })
    .where(eq(properties.id, propertyId));

  revalidatePath("/dashboard/owner/properties");
  return { success: true };
}