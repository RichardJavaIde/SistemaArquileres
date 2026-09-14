// src/app/actions/users.ts
"use server";

import { db } from "@/db";
import { user, contracts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createStaffSchema, createTenantSchema, updateTenantSchema, resetPasswordSchema } from "@/validators/user";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["owner", "admin"].includes((session.user as any).role)) {
    return null;
  }
  return session;
}
export async function createStaffUser(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return { error: "Solo un administrador puede crear este tipo de usuario" };
  }

  const validation = createStaffSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  const { name, email, password, role } = validation.data;

  try {
    const result = await auth.api.signUpEmail({ body: { name, email, password } });
    if (!result.user) return { error: "No se pudo crear el usuario" };

    await db.update(user).set({ role }).where(eq(user.id, result.user.id));
    return { success: true };
  } catch (err: any) {
  if (err?.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || err?.statusCode === 422) {
    return { error: "Ya existe un usuario registrado con ese email" };
  }
  throw err;
}
}

// ...createStaffUser y createTenant existentes se quedan igual, solo actualiza
// createTenant para incluir phone/cedula en el insert (ver abajo)...

export async function createTenant(input: unknown) {
  const session = await requireStaff();
  if (!session) return { error: "No tienes permiso para registrar inquilinos" };

  const validation = createTenantSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  const { name, email, password, phone, cedula } = validation.data;

  try {
    const result = await auth.api.signUpEmail({ body: { name, email, password } });
    if (!result.user) {
      return { error: "No se pudo crear el inquilino" };
    }

    await db.update(user).set({ phone: phone || null, cedula: cedula || null }).where(eq(user.id, result.user.id));
    return { success: true };
  } catch (err: any) {
  if (err?.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || err?.statusCode === 422) {
    return { error: "Ya existe un usuario registrado con ese email" };
  }
  throw err;
}
}

export async function listTenants() {
  const session = await requireStaff();
  if (!session) return [];

  return db
    .select({ id: user.id, name: user.name, email: user.email, phone: user.phone, cedula: user.cedula })
    .from(user)
    .where(and(eq(user.role as any, "tenant"), eq(user.isActive as any, true)));
}

export async function updateTenant(tenantId: string, input: unknown) {
  const session = await requireStaff();
  if (!session) return { error: "No tienes permiso para editar inquilinos" };

  const validation = updateTenantSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  const { name, phone, cedula } = validation.data;
  await db
    .update(user)
    .set({ name, phone: phone || null, cedula: cedula || null })
    .where(eq(user.id, tenantId));

  revalidatePath("/dashboard/owner/tenants");
  return { success: true };
}

export async function disableTenant(tenantId: string) {
  const session = await requireStaff();
  if (!session) return { error: "No tienes permiso para deshabilitar inquilinos" };

  const [activeContract] = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.tenantId, tenantId), eq(contracts.status, "active")));

  if (activeContract) {
    return { error: "No puedes deshabilitar un inquilino con un contrato activo" };
  }

  await db.update(user).set({ isActive: false }).where(eq(user.id, tenantId));
  revalidatePath("/dashboard/owner/tenants");
  return { success: true };
}

export async function resetTenantPassword(tenantId: string, input: unknown) {
  const session = await requireStaff();
  if (!session) return { error: "No tienes permiso para resetear contraseñas" };

  const validation = resetPasswordSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  await auth.api.setUserPassword({
    body: { userId: tenantId, newPassword: validation.data.newPassword },
    headers: await headers(),
  });

  return { success: true };
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") return null;
  return session;
}

export async function listStaffUsers() {
  const session = await requireAdmin();
  if (!session) return [];

  return db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role })
    .from(user)
    .where(inArray(user.role as any, ["admin", "owner"]));
}

export async function updateStaffUser(userId: string, input: unknown) {
  const session = await requireAdmin();
  if (!session) return { error: "Solo un administrador puede editar usuarios" };

  const validation = createStaffSchema
    .omit({ email: true, password: true }) // en editar no se cambia el email ni la contraseña aquí
    .safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  await db
    .update(user)
    .set({ name: validation.data.name, role: validation.data.role })
    .where(eq(user.id, userId));

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function resetStaffPassword(userId: string, input: unknown) {
  const session = await requireAdmin();
  if (!session) return { error: "Solo un administrador puede resetear contraseñas" };

  const validation = resetPasswordSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0].message };

  await auth.api.setUserPassword({
    body: { userId, newPassword: validation.data.newPassword },
    headers: await headers(),
  });

  return { success: true };
}