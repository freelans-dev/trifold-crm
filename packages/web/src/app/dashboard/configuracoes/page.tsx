import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

const CONFIG_CARDS = [
  {
    href: "/dashboard/configuracoes/empresa",
    icon: "◈",
    title: "Empresa",
    description: "Dados da organizacao",
  },
  {
    href: "/dashboard/configuracoes/usuarios",
    icon: "◎",
    title: "Usuarios",
    description: "Gerenciar usuarios e permissoes",
  },
  {
    href: "/dashboard/configuracoes/horario",
    icon: "▣",
    title: "Horario Comercial",
    description: "Horarios de atendimento",
  },
  {
    href: "/dashboard/configuracoes/integracoes",
    icon: "⟁",
    title: "Integracoes",
    description: "Meta Ads, WhatsApp, Telegram",
  },
  {
    href: "/dashboard/configuracoes/personalidade",
    icon: "◬",
    title: "Personalidade Nicole",
    description: "Prompts e comportamento",
  },
  {
    href: "/dashboard/configuracoes/pipeline",
    icon: "▦",
    title: "Etapas do Pipeline",
    description: "Configurar etapas do funil de vendas",
  },
  {
    href: "/dashboard/pipeline/config",
    icon: "△",
    title: "Follow-up",
    description: "Regras de follow-up por etapa",
  },
]

export default async function ConfiguracoesPage() {
  await getServerUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie as configuracoes do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONFIG_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-lg text-orange-600">
                {card.icon}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700">
                  {card.title}
                </h2>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
