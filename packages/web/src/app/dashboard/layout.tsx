import { getServerUser } from "@web/lib/auth"
import { SidebarNav } from "@web/components/layout/sidebar-nav"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: "▦" },
  { href: "/dashboard/leads", label: "Leads", icon: "◉" },
  { href: "/dashboard/properties", label: "Imoveis", icon: "⌂" },
  { href: "/dashboard/corretores", label: "Corretores", icon: "◎" },
  { href: "/dashboard/conversas", label: "Conversas", icon: "◬" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "▣" },
  { href: "/dashboard/atividades", label: "Atividades", icon: "◫" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "◩" },
  { href: "/dashboard/treinamento", label: "Treinamento", icon: "◧" },
  { href: "/dashboard/configuracoes/pipeline", label: "Config", icon: "⚙" },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  return (
    <div className="min-h-screen bg-stone-50">
      <SidebarNav
        items={NAV_ITEMS}
        userName={user.name}
        userRole={user.role}
        basePath="/dashboard"
      />

      {/* Main content area */}
      <main className="lg:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
