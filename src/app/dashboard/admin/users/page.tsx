// src/app/dashboard/admin/users/page.tsx
import { listStaffUsers } from "@/app/actions/users";
import Link from "next/link";
import { cardClass, pageHeaderClass, titleClass, buttonPrimaryClass, buttonEditClass } from "@/lib/styles";
import { ResetStaffPasswordButton } from "./ResetStaffPasswordButton";

const roleLabel: Record<string, string> = { admin: "Administrador", owner: "Owner" };

export default async function StaffUsersPage() {
  const users = await listStaffUsers();

  return (
    <div>
      <div className={pageHeaderClass}>
        <h1 className={titleClass}>Usuarios administrativos</h1>
        <Link href="/dashboard/admin/users/new" className={buttonPrimaryClass}>
          + Nuevo usuario
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">No hay usuarios administrativos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className={cardClass}>
              <p className="font-medium text-gray-900">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <p className="text-sm text-gray-500">{u.role ? roleLabel[u.role] ?? u.role : "Sin rol"}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <Link href={`/dashboard/admin/users/${u.id}/edit`} className={buttonEditClass}>
                  Editar
                </Link>
                <ResetStaffPasswordButton userId={u.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}