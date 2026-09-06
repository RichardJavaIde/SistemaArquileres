// src/validators/property.ts
import { z } from "zod";

export const createPropertySchema = z.object({
  address: z.string().min(5, "La dirección debe ser más específica"),
  type: z.enum(["house", "apartment", "land", "commercial"]),
  description: z.string().optional(),
  monthlyPrice: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;