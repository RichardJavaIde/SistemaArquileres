// src/validators/auth.ts
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const signInSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Tipos de TypeScript generados AUTOMÁTICAMENTE a partir del schema de Zod
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;