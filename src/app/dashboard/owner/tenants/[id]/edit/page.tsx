// src/app/dashboard/owner/tenants/[id]/edit/page.tsx
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { titleClass } from "@/lib/styles";
import { EditTenantForm } from "./EditTenantForm";

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  const [tenant] = await db
    .select({ id: user.id, name: user.name, phone: user.phone, cedula: user.cedula })
    .from(user)
    .where(eq(user.id, id));

  if (!tenant) notFound();

  return (
    <div className="max-w-md">
      <h1 className={`${titleClass} mb-6`}>Editar inquilino</h1>
      <EditTenantForm tenant={tenant} />
    </div>
  );
}