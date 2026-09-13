// src/validators/user.ts
import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["admin", "owner"], { message: "Selecciona un rol válido" }),
});

export const createTenantSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().min(7, "Número de teléfono inválido").optional().or(z.literal("")),
  cedula: z.string().min(5, "Cédula inválida").optional().or(z.literal("")),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  phone: z.string().min(7, "Número de teléfono inválido").optional().or(z.literal("")),
  cedula: z.string().min(5, "Cédula inválida").optional().or(z.literal("")),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});