import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"
import { notFound } from "next/navigation"

const interestLevelLabels: Record<string, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente",
}

const interestLevelColors: Record<string, string> = {
  cold: "bg-blue-100 text-blue-700",
  warm: "bg-yellow-100 text-yellow-700",
  hot: "bg-red-100 text-red-700",
}

const sourceLabels: Record<string, string> = {
  whatsapp_organic: "WhatsApp Organico",
  whatsapp_click_to_ad: "WhatsApp Click-to-Ad",
  meta_ads: "Meta Ads",
  website: "Website",
  referral: "Indicacao",
  walk_in: "Walk-in",
  telegram: "Telegram",
  other: "Outro",
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await getServerUser()
  const supabase = await createClient()

  // Fetch lead with relations
  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      stage:kanban_stages(id, name, slug, type, color),
      property_interest:properties!property_interest_id(id, name, slug),
      broker:users!assigned_broker_id(id, name, email, avatar_url)
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !lead) {
    notFound()
  }

  const stageArr = lead.stage as unknown as Array<{
    id: string
    name: string
    slug: string
    type: string
    color: string | null
  }> | null
  const stage = stageArr?.[0] ?? null

  const propertyArr = lead.property_interest as unknown as Array<{
    id: string
    name: string
    slug: string
  }> | null
  const property = propertyArr?.[0] ?? null

  const brokerArr = lead.broker as unknown as Array<{
    id: string
    name: string
    email: string
    avatar_url: string | null
  }> | null
  const broker = brokerArr?.[0] ?? null

  // Fetch conversations and messages
  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id, channel, status, last_message_at,
      messages:messages(id, role, content, created_at)
    `
    )
    .eq("lead_id", id)
    .order("last_message_at", { ascending: false })
    .limit(5)

  // Fetch activities
  const { data: activities } = await supabase
    .from("activities")
    .select("id, type, description, created_at, user:users(name)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Voltar para leads
      </Link>

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.name || "Sem nome"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{lead.phone}</span>
              {lead.email && <span>{lead.email}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stage && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: stage.color
                    ? `${stage.color}20`
                    : "#f3f4f6",
                  color: stage.color || "#374151",
                }}
              >
                {stage.name}
              </span>
            )}
            {lead.qualification_score != null && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  lead.qualification_score >= 70
                    ? "bg-green-100 text-green-700"
                    : lead.qualification_score >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                Score: {lead.qualification_score}
              </span>
            )}
            {lead.interest_level && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  interestLevelColors[lead.interest_level] ??
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {interestLevelLabels[lead.interest_level] ??
                  lead.interest_level}
              </span>
            )}
          </div>
        </div>
        {broker && (
          <div className="mt-3 text-sm text-gray-500">
            Corretor: <span className="font-medium">{broker.name}</span>{" "}
            ({broker.email})
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Info Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informacoes
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Empreendimento</dt>
              <dd className="font-medium text-gray-900">
                {property ? (
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    {property.name}
                  </Link>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Quartos</dt>
              <dd className="font-medium text-gray-900">
                {lead.preferred_bedrooms ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Andar</dt>
              <dd className="font-medium text-gray-900">
                {lead.preferred_floor ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Vista</dt>
              <dd className="font-medium text-gray-900">
                {lead.preferred_view ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Vagas</dt>
              <dd className="font-medium text-gray-900">
                {lead.preferred_garage_count ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Tem entrada</dt>
              <dd className="font-medium text-gray-900">
                {lead.has_down_payment === true
                  ? "Sim"
                  : lead.has_down_payment === false
                    ? "Nao"
                    : "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Origem</dt>
              <dd className="font-medium text-gray-900">
                {lead.source
                  ? (sourceLabels[lead.source] ?? lead.source)
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Canal</dt>
              <dd className="font-medium text-gray-900">
                {lead.channel ?? "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* AI Summary */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Resumo IA
          </h2>
          {lead.ai_summary ? (
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {lead.ai_summary}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Nenhum resumo gerado pela IA.
            </p>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Conversas
        </h2>
        {conversations && conversations.length > 0 ? (
          <div className="space-y-6">
            {conversations.map((conv) => {
              const messages = (conv.messages ?? []) as Array<{
                id: string
                role: string
                content: string
                created_at: string
              }>
              const sortedMessages = [...messages].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )

              return (
                <div key={conv.id} className="space-y-2">
                  <div className="text-xs font-medium uppercase text-gray-400">
                    {conv.channel} — {conv.status}
                  </div>
                  <div className="space-y-2">
                    {sortedMessages.map((msg) => {
                      const isUser = msg.role === "user"
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                              isUser
                                ? "bg-gray-100 text-gray-800"
                                : msg.role === "broker"
                                  ? "bg-orange-100 text-orange-900"
                                  : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            <div className="mb-1 text-[10px] font-medium uppercase opacity-60">
                              {msg.role === "user"
                                ? "Lead"
                                : msg.role === "assistant"
                                  ? "IA"
                                  : msg.role === "broker"
                                    ? "Corretor"
                                    : msg.role}
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <div className="mt-1 text-[10px] opacity-50">
                              {new Date(msg.created_at).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma conversa registrada.</p>
        )}
      </div>

      {/* Activities Timeline */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Atividades
        </h2>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const activityUserArr = activity.user as unknown as Array<{
                name: string
              }> | null
              const activityUser = activityUserArr?.[0] ?? null

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-l-2 border-gray-200 pl-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-gray-400">
                        {activity.type}
                      </span>
                      {activityUser && (
                        <span className="text-xs text-gray-400">
                          por {activityUser.name}
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-gray-700">
                        {activity.description}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(activity.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma atividade registrada.</p>
        )}
      </div>
    </div>
  )
}
