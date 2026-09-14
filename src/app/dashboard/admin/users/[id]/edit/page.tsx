// src/app/dashboard/admin/users/[id]/edit/page.tsx
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { titleClass } from "@/lib/styles";
import { EditStaffForm } from "./EditStaffForm";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if ((session.user as any).role !== "admin") redirect("/");

  const [staffUser] = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.id, id));

  if (!staffUser) notFound();

  const normalizedStaffUser = {
    ...staffUser,
    role: staffUser.role ?? "tenant",
  };
   return (
    <div className="max-w-md">
      <h1 className={`${titleClass} mb-6`}>Editar usuario</h1>
      <EditStaffForm staffUser={normalizedStaffUser} />
    </div>
  );
}