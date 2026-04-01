import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

export default async function CampaignsPage() {
  const user = await getServerUser()
  const supabase = await createClient()

  // Fetch leads with utm_campaign grouped data
  const { data: leads } = await supabase
    .from("leads")
    .select("id, utm_campaign, stage:kanban_stages(slug)")
    .eq("is_active", true)
    .not("utm_campaign", "is", null)

  // Group by utm_campaign
  const campaignMap: Record<
    string,
    { total: number; qualified: number; converted: number }
  > = {}

  for (const lead of leads ?? []) {
    const campaign = lead.utm_campaign as string
    if (!campaignMap[campaign]) {
      campaignMap[campaign] = { total: 0, qualified: 0, converted: 0 }
    }
    campaignMap[campaign].total += 1

    const stageArr = lead.stage as unknown as Array<{ slug: string }> | null
    const stageSlug = stageArr?.[0]?.slug ?? null

    if (
      stageSlug &&
      !["novo", "new", "nao_qualificado"].includes(stageSlug)
    ) {
      campaignMap[campaign].qualified += 1
    }

    if (stageSlug === "fechou") {
      campaignMap[campaign].converted += 1
    }
  }

  const campaigns = Object.entries(campaignMap)
    .map(([name, data]) => ({
      campaign: name,
      total: data.total,
      qualified: data.qualified,
      converted: data.converted,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Performance de Campanhas
        </h1>
        <Link
          href="/dashboard/analytics"
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Voltar para Analytics
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Campanha</th>
              <th className="px-6 py-3">Total de Leads</th>
              <th className="px-6 py-3">Qualificados %</th>
              <th className="px-6 py-3">Convertidos %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c) => {
              const qualifiedPct =
                c.total > 0
                  ? Math.round((c.qualified / c.total) * 100)
                  : 0
              const convertedPct =
                c.total > 0
                  ? Math.round((c.converted / c.total) * 100)
                  : 0

              return (
                <tr key={c.campaign} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {c.campaign}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.total}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {qualifiedPct}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {convertedPct}%
                    </span>
                  </td>
                </tr>
              )
            })}
            {campaigns.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nenhuma campanha com leads encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
