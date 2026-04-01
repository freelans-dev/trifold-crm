import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BrokerLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getServerUser()
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `*,
       kanban_stages:stage_id(name, color),
       properties:property_interest_id(name, slug)`
    )
    .eq("id", id)
    .eq("assigned_broker_id", user.id)
    .single()

  if (!lead) notFound()

  // Get conversations and messages
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, channel, status, is_ai_active, last_message_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })

  const conversationIds = conversations?.map((c) => c.id) ?? []

  const { data: messages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true })
        .limit(50)
    : { data: [] }

  const stage = Array.isArray(lead.kanban_stages)
    ? lead.kanban_stages[0]
    : lead.kanban_stages
  const property = Array.isArray(lead.properties)
    ? lead.properties[0]
    : lead.properties

  return (
    <div className="space-y-6">
      <Link
        href="/broker"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Meus Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.name || lead.phone}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span>{lead.phone}</span>
            {lead.email && <span>{lead.email}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stage && (
            <span
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{
                backgroundColor: `${stage.color}20`,
                color: stage.color,
              }}
            >
              {stage.name}
            </span>
          )}
          {lead.qualification_score != null && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                lead.qualification_score >= 70
                  ? "bg-green-100 text-green-700"
                  : lead.qualification_score >= 40
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              Score: {lead.qualification_score}
            </span>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Dados do Lead</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Empreendimento</dt>
              <dd className="font-medium">{property?.name ?? "Nao definido"}</dd>
            </div>
            {lead.preferred_bedrooms && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Quartos</dt>
                <dd className="font-medium">{lead.preferred_bedrooms}</dd>
              </div>
            )}
            {lead.preferred_floor && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Andar</dt>
                <dd className="font-medium">{lead.preferred_floor}</dd>
              </div>
            )}
            {lead.preferred_view && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Vista</dt>
                <dd className="font-medium">{lead.preferred_view}</dd>
              </div>
            )}
            {lead.preferred_garage_count != null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Vagas</dt>
                <dd className="font-medium">{lead.preferred_garage_count}</dd>
              </div>
            )}
            {lead.has_down_payment != null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Tem entrada</dt>
                <dd className="font-medium">
                  {lead.has_down_payment ? "Sim" : "Nao"}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* AI Summary */}
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Resumo IA</h2>
          {lead.ai_summary ? (
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {lead.ai_summary}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              O resumo sera gerado automaticamente apos a conversa com a Nicole.
            </p>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Conversa com o Agente</h2>
        {messages && messages.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-gray-100 text-gray-800"
                      : msg.role === "assistant"
                      ? "bg-purple-100 text-purple-900"
                      : "bg-blue-100 text-blue-900"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma mensagem ainda.</p>
        )}
      </div>
    </div>
  )
}
