// src/app/dashboard/owner/tenants/page.tsx
import { listTenants } from "@/app/actions/users";
import Link from "next/link";
import { cardClass, pageHeaderClass, titleClass, buttonPrimaryClass, buttonEditClass } from "@/lib/styles";
import { DisableTenantButton } from "./DisableTenantButton";
import { ResetPasswordButton } from "./ResetPasswordButton";

export default async function TenantsPage() {
  const tenants = await listTenants();

  return (
    <div>
      <div className={pageHeaderClass}>
        <h1 className={titleClass}>Inquilinos</h1>
        <Link href="/dashboard/owner/tenants/new" className={buttonPrimaryClass}>
          + Nuevo inquilino
        </Link>
      </div>

      {tenants.length === 0 ? (
        <p className="text-gray-500">No hay inquilinos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <div key={t.id} className={cardClass}>
              <p className="font-medium text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-500">{t.email}</p>
              {t.phone && <p className="text-sm text-gray-500">Tel: {t.phone}</p>}
              {t.cedula && <p className="text-sm text-gray-500">Cédula: {t.cedula}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <Link href={`/dashboard/owner/tenants/${t.id}/edit`} className={buttonEditClass}>
                  Editar
                </Link>
                <ResetPasswordButton tenantId={t.id} />
                <DisableTenantButton tenantId={t.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}