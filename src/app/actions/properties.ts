// src/app/actions/properties.ts
"use server";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { createPropertySchema } from "@/validators/property";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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