import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"

export default async function CorretoresPage() {
  const user = await getServerUser()
  const supabase = await createClient()

  const isAdmin = user.role === "admin"

  // Get brokers with user info
  const { data: brokers } = await supabase
    .from("brokers")
    .select(
      `
      id, creci, type, is_available, max_leads, created_at,
      user:users!user_id(id, name, email, avatar_url, is_active)
    `
    )
    .eq("org_id", user.orgId)

  // Get active lead counts per broker user
  const userIds = (brokers ?? [])
    .map((b) => {
      const u = b.user as unknown as { id: string } | null
      return u?.id
    })
    .filter(Boolean) as string[]

  let leadCounts: Record<string, number> = {}

  if (userIds.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("assigned_broker_id")
      .eq("org_id", user.orgId)
      .eq("is_active", true)
      .in("assigned_broker_id", userIds)

    if (leads) {
      leadCounts = leads.reduce(
        (acc, lead) => {
          const brokerId = lead.assigned_broker_id as string
          acc[brokerId] = (acc[brokerId] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Corretores</h1>
        <p className="text-sm text-gray-500">
          {brokers?.length ?? 0} corretores cadastrados
        </p>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">CRECI</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Disponivel</th>
              <th className="px-6 py-3">Leads ativos</th>
              {isAdmin && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brokers?.map((broker) => {
              const brokerUser = broker.user as unknown as {
                id: string
                name: string
                email: string
                avatar_url: string | null
                is_active: boolean
              } | null

              const activeLeads = brokerUser
                ? leadCounts[brokerUser.id] || 0
                : 0

              const typeLabels: Record<string, string> = {
                internal: "Interno",
                external: "Externo",
                partner: "Parceiro",
              }

              return (
                <tr key={broker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {brokerUser?.name ?? "Sem nome"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {brokerUser?.email ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {broker.creci || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {typeLabels[broker.type] ?? broker.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {broker.is_available ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Disponivel
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Indisponivel
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activeLeads} / {broker.max_leads ?? 50}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <ToggleAvailability
                        brokerId={broker.id}
                        isAvailable={broker.is_available}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
            {(!brokers || brokers.length === 0) && (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nenhum corretor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ToggleAvailability({
  brokerId,
  isAvailable,
}: {
  brokerId: string
  isAvailable: boolean
}) {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await (
          await import("@web/lib/supabase/server")
        ).createClient()
        await supabase
          .from("brokers")
          .update({ is_available: !isAvailable })
          .eq("id", brokerId)
      }}
    >
      <button
        type="submit"
        className={`rounded-md px-3 py-1 text-xs font-medium ${
          isAvailable
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        {isAvailable ? "Desativar" : "Ativar"}
      </button>
    </form>
  )
}
