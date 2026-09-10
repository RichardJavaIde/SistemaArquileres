// src/app/dashboard/admin/users/new/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { titleClass } from "@/lib/styles";
import { StaffForm } from "./StaffForm";

export default async function NewStaffPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if ((session.user as any).role !== "admin") redirect("/");

  return (
    <div className="max-w-md">
      <h1 className={`${titleClass} mb-6`}>Nuevo usuario administrativo</h1>
      <StaffForm />
    </div>
  );
}