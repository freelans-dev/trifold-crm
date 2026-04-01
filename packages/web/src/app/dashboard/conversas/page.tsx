import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

export default async function ConversasPage() {
  await getServerUser()
  const supabase = await createClient()

  // Get active conversations with lead info and last message
  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id, channel, status, is_ai_active, handoff_at, last_message_at, created_at,
      lead:leads!lead_id(id, name, phone)
    `
    )
    .eq("status", "active")
    .order("last_message_at", { ascending: false })

  // Get last message for each conversation
  const conversationIds = (conversations ?? []).map((c) => c.id)
  const lastMessages: Record<string, { content: string; created_at: string }> = {}

  if (conversationIds.length > 0) {
    // Get the most recent message per conversation
    const { data: messages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })

    if (messages) {
      // Keep only the first (most recent) message per conversation
      for (const msg of messages) {
        if (!lastMessages[msg.conversation_id]) {
          lastMessages[msg.conversation_id] = {
            content: msg.content,
            created_at: msg.created_at,
          }
        }
      }
    }
  }

  const channelLabels: Record<string, { label: string; color: string; bg: string }> = {
    whatsapp: { label: "WhatsApp", color: "text-green-700", bg: "bg-green-100" },
    telegram: { label: "Telegram", color: "text-blue-700", bg: "bg-blue-100" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
        <p className="text-sm text-gray-500">
          {conversations?.length ?? 0} conversas ativas
        </p>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Canal</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Ultima mensagem</th>
              <th className="px-6 py-3">Horario</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conversations?.map((conv) => {
              const lead = conv.lead as unknown as {
                id: string
                name: string | null
                phone: string
              } | null

              const channel = channelLabels[conv.channel] ?? {
                label: conv.channel,
                color: "text-gray-700",
                bg: "bg-gray-100",
              }

              const lastMsg = lastMessages[conv.id]
              const preview = lastMsg
                ? lastMsg.content.length > 80
                  ? lastMsg.content.substring(0, 80) + "..."
                  : lastMsg.content
                : "-"

              const lastTime = conv.last_message_at || lastMsg?.created_at

              return (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link
                      href={`/dashboard/conversas/${conv.id}`}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      {lead?.name || lead?.phone || "Desconhecido"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${channel.bg} ${channel.color}`}
                    >
                      {channel.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {conv.is_ai_active ? (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        IA ativa
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Handoff
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs px-6 py-4 text-sm text-gray-500 truncate">
                    {preview}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lastTime
                      ? new Date(lastTime).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {lead && (
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        Ver lead
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
            {(!conversations || conversations.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Nenhuma conversa ativa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
