import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

const typeBadgeStyles: Record<string, string> = {
  stage_change: "bg-blue-100 text-blue-700",
  handoff: "bg-purple-100 text-purple-700",
  lead_created: "bg-green-100 text-green-700",
  note_added: "bg-gray-100 text-gray-700",
}

const typeLabels: Record<string, string> = {
  stage_change: "Mudanca de etapa",
  handoff: "Handoff",
  lead_created: "Lead criado",
  note_added: "Nota",
  broker_assigned: "Corretor atribuido",
}

export default async function AtividadesPage() {
  const user = await getServerUser()
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from("activities")
    .select(
      `
      id, type, description, metadata, created_at, lead_id, user_id,
      leads:lead_id(name, phone),
      users:user_id(name)
    `
    )
    .eq("org_id", user.orgId)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Data/Hora</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Descricao</th>
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities?.map((activity) => {
              const leadArr = activity.leads as unknown as Array<{
                name: string | null
                phone: string | null
              }> | null
              const lead = leadArr?.[0] ?? null

              const userArr = activity.users as unknown as Array<{
                name: string
              }> | null
              const activityUser = userArr?.[0] ?? null

              const badgeStyle =
                typeBadgeStyles[activity.type] ?? "bg-gray-100 text-gray-700"
              const typeLabel =
                typeLabels[activity.type] ?? activity.type

              return (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activity.created_at
                      ? new Date(activity.created_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
                    >
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {activity.description ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {activity.lead_id && lead?.name ? (
                      <Link
                        href={`/dashboard/leads/${activity.lead_id}`}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        {lead.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activityUser?.name ?? "-"}
                  </td>
                </tr>
              )
            })}
            {(!activities || activities.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nenhuma atividade encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
