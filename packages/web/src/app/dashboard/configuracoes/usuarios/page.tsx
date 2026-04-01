import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function UsuariosPage() {
  const user = await getServerUser()

  if (!["admin", "supervisor"].includes(user.role)) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const isAdmin = user.role === "admin"

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, is_active, created_at")
    .eq("org_id", user.orgId)
    .order("name")

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    supervisor: "bg-blue-100 text-blue-700",
    broker: "bg-green-100 text-green-700",
  }

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    supervisor: "Supervisor",
    broker: "Corretor",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/configuracoes"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Configuracoes
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerenciar usuarios e permissoes
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/corretores/novo"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Novo usuario
          </Link>
        )}
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Perfil</th>
              <th className="px-6 py-3">Status</th>
              {isAdmin && <th className="px-6 py-3">Acoes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {u.name || "Sem nome"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  {isAdmin && u.id !== user.id ? (
                    <RoleDropdown userId={u.id} currentRole={u.role} />
                  ) : (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        roleColors[u.role] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    {u.id !== user.id && (
                      <ToggleActiveButton userId={u.id} isActive={u.is_active} />
                    )}
                  </td>
                )}
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nenhum usuario encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoleDropdown({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server"
        const newRole = formData.get("role") as string
        if (!["admin", "supervisor", "broker"].includes(newRole)) return

        const supabase = await (
          await import("@web/lib/supabase/server")
        ).createClient()
        await supabase.from("users").update({ role: newRole }).eq("id", userId)
      }}
    >
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => {
          const form = e.target.closest("form")
          if (form) form.requestSubmit()
        }}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-orange-500 focus:outline-none"
      >
        <option value="admin">Admin</option>
        <option value="supervisor">Supervisor</option>
        <option value="broker">Corretor</option>
      </select>
    </form>
  )
}

function ToggleActiveButton({
  userId,
  isActive,
}: {
  userId: string
  isActive: boolean
}) {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await (
          await import("@web/lib/supabase/server")
        ).createClient()
        await supabase
          .from("users")
          .update({ is_active: !isActive })
          .eq("id", userId)
      }}
    >
      <button
        type="submit"
        className={`rounded-md px-3 py-1 text-xs font-medium ${
          isActive
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        {isActive ? "Desativar" : "Ativar"}
      </button>
    </form>
  )
}
