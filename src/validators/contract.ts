// src/validators/contract.ts
import { z } from "zod";

export const createContractSchema = z.object({
  propertyId: z.string().uuid("Selecciona un inmueble válido"),
  tenantId: z.string().min(1, "Selecciona un inquilino"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  months: z.coerce.number().int().min(1, "Mínimo 1 mes").max(60, "Máximo 60 meses"),
  monthlyRent: z.coerce.number().positive("El monto debe ser mayor a 0"),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;