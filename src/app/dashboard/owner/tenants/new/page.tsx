// src/app/dashboard/owner/tenants/new/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { titleClass } from "@/lib/styles";
import { TenantForm } from "./TenantForm";

export default async function NewTenantPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (!["owner", "admin"].includes((session.user as any).role)) redirect("/");

  return (
    <div className="max-w-md">
      <h1 className={`${titleClass} mb-6`}>Registrar inquilino</h1>
      <TenantForm />
    </div>
  );
}