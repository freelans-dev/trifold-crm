import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

export default async function BrokerHomePage() {
  const user = await getServerUser()
  const supabase = await createClient()

  // Get broker's leads
  const { data: leads } = await supabase
    .from("leads")
    .select(
      `id, name, phone, email, qualification_score, interest_level,
       stage_id, property_interest_id, created_at, updated_at,
       kanban_stages:stage_id(name, color),
       properties:property_interest_id(name)`
    )
    .eq("assigned_broker_id", user.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus Leads</h1>
        <p className="text-sm text-gray-500">
          {leads?.length ?? 0} leads designados
        </p>
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            Voce nao tem leads designados. Novos leads serao atribuidos pelo
            supervisor.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Lead</th>
                <th className="px-6 py-3">Empreendimento</th>
                <th className="px-6 py-3">Etapa</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Ultimo contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead: Record<string, unknown>) => {
                const stage = Array.isArray(lead.kanban_stages)
                  ? lead.kanban_stages[0]
                  : lead.kanban_stages
                const property = Array.isArray(lead.properties)
                  ? lead.properties[0]
                  : lead.properties
                return (
                  <tr key={lead.id as string} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/broker/leads/${lead.id}`}
                        className="font-medium text-gray-900 hover:text-orange-600"
                      >
                        {(lead.name as string) || (lead.phone as string)}
                      </Link>
                      <p className="text-xs text-gray-500">{lead.phone as string}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {property?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      {stage && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${stage.color}20`,
                            color: stage.color,
                          }}
                        >
                          {stage.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.qualification_score != null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            (lead.qualification_score as number) >= 70
                              ? "bg-green-100 text-green-700"
                              : (lead.qualification_score as number) >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {lead.qualification_score as number}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.updated_at as string).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
