// src/app/actions/users.ts
"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { createStaffSchema, createTenantSchema } from "@/validators/user";

export async function createStaffUser(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return { error: "Solo un administrador puede crear este tipo de usuario" };
  }

  const validation = createStaffSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { name, email, password, role } = validation.data;

  const result = await auth.api.signUpEmail({ body: { name, email, password } });
  if (!result.user) {
    return { error: "No se pudo crear el usuario (puede que el email ya exista)" };
  }

  // signUpEmail siempre crea con el rol por defecto ("tenant"); lo actualizamos aquí
  await db.update(user).set({ role }).where(eq(user.id, result.user.id));

  return { success: true };
}

export async function createTenant(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para registrar inquilinos" };
  }

  const validation = createTenantSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const result = await auth.api.signUpEmail({ body: validation.data });
  if (!result.user) {
    return { error: "No se pudo crear el inquilino (puede que el email ya exista)" };
  }

  return { success: true };
}