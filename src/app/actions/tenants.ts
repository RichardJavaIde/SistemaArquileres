// src/app/actions/tenants.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function createTenant(input: unknown) {
  // Solo el staff (admin) o los dueños pueden registrar inquilinos
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["admin", "owner"].includes((session.user as any).role)) {
    return { error: "No tienes permiso para registrar inquilinos" };
  }

  const validation = createTenantSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Usamos la API de servidor de Better Auth para crear la cuenta directamente
  const result = await auth.api.signUpEmail({
    body: validation.data,
  });

  if (!result.user) {
    return { error: "No se pudo crear el inquilino (puede que el email ya exista)" };
  }

  return { success: true, tenant: result.user };
}