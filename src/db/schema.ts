// src/db/schema.ts
// Aquí irán todas nuestras tablas. Empezamos vacío a propósito.
// src/db/schema.ts
import { pgTable, uuid, varchar, timestamp, pgEnum, text, numeric,date } from "drizzle-orm/pg-core";

// Un "enum" limita los valores posibles de una columna a una lista fija.
// Esto evita que alguien guarde role: "vecino" por error.
export const roleEnum = pgEnum("role", ["admin", "owner", "tenant"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull().default("tenant"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definimos otro enum para los tipos de propiedad

export const propertyTypeEnum = pgEnum("property_type", [
  "house", "apartment", "land", "commercial",
]);

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  address: varchar("address", { length: 500 }).notNull(),
  type: propertyTypeEnum("type").notNull(),
  description: text("description"),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definimos otro enum para los estados del contrato

export const contractStatusEnum = pgEnum("contract_status", [
  "active", "finished", "cancelled",
]);

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "restrict" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  monthlyRent: numeric("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  status: contractStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definimos otro enum para los estados del pago

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "paid", "late",
]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});