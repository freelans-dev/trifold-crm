import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"
import { notFound } from "next/navigation"

const roleConfig: Record<
  string,
  { label: string; align: string; bubble: string }
> = {
  user: {
    label: "Lead",
    align: "justify-start",
    bubble: "bg-gray-100 text-gray-800",
  },
  assistant: {
    label: "IA",
    align: "justify-end",
    bubble: "bg-purple-100 text-purple-900",
  },
  broker: {
    label: "Corretor",
    align: "justify-end",
    bubble: "bg-blue-100 text-blue-900",
  },
  system: {
    label: "Sistema",
    align: "justify-center",
    bubble: "bg-yellow-100 text-yellow-900",
  },
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await getServerUser()
  const supabase = await createClient()

  // Fetch conversation with lead info
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(
      `
      id, channel, status, is_ai_active, handoff_at, last_message_at, created_at,
      lead:leads!lead_id(id, name, phone)
    `
    )
    .eq("id", id)
    .single()

  if (error || !conversation) {
    notFound()
  }

  const lead = conversation.lead as unknown as {
    id: string
    name: string | null
    phone: string
  } | null

  // Fetch all messages ordered by created_at ascending
  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/conversas"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Voltar para conversas
      </Link>

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {lead?.name || "Sem nome"}
            </h1>
            <p className="text-sm text-gray-500">{lead?.phone ?? "-"}</p>
          </div>
          <div className="flex items-center gap-2">
            {conversation.status === "handed_off" ? (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Handoff
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Ativa
              </span>
            )}
            {conversation.is_ai_active ? (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                IA ativa
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                IA inativa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Mensagens</h2>
        {messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => {
              const config = roleConfig[msg.role] ?? {
                label: msg.role,
                align: "justify-start",
                bubble: "bg-gray-100 text-gray-800",
              }

              return (
                <div key={msg.id} className={`flex ${config.align}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${config.bubble}`}
                  >
                    <div className="mb-1 text-[10px] font-medium uppercase opacity-60">
                      {config.label}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className="mt-1 text-[10px] opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
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
          <p className="text-sm text-gray-400">Nenhuma mensagem registrada.</p>
        )}
      </div>
    </div>
  )
}
