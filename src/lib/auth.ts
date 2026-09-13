// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  plugins: [
    adminPlugin({
      defaultRole: "tenant", // <-- esto es lo que faltaba
      adminRoles: ["admin"], // le decimos al plugin cuál de tus roles es el "admin" real
    }),
  ],
  user: {
    additionalFields: {
      phone: { type: "string", required: false, input: true },
      cedula: { type: "string", required: false, input: true },
      isActive: { type: "boolean", defaultValue: true, input: false },
      // ya no hace falta declarar "role" aquí — el plugin admin ahora lo controla él mismo
    },
  },
});