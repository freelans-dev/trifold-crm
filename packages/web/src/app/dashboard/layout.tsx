import { getServerUser } from "@web/lib/auth"
import { createClient } from "@web/lib/supabase/server"
import { SidebarNav } from "@web/components/layout/sidebar-nav"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: "▦" },
  { href: "/dashboard/leads", label: "Leads", icon: "◉" },
  { href: "/dashboard/properties", label: "Imóveis", icon: "⌂" },
  { href: "/dashboard/corretores", label: "Corretores", icon: "◎" },
  { href: "/dashboard/conversas", label: "Conversas", icon: "◬" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "▣" },
  { href: "/dashboard/alertas", label: "Alertas", icon: "△" },
  { href: "/dashboard/atividades", label: "Atividades", icon: "◫" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "◩" },
  { href: "/dashboard/treinamento", label: "Treinamento", icon: "◧" },
  { href: "/dashboard/configuracoes", label: "Config", icon: "⚙" },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  const supabase = await createClient()

  // Count pending alerts for sidebar badge
  const { count: alertCount } = await supabase
    .from("follow_up_log")
    .select("id", { count: "exact", head: true })
    .eq("org_id", user.orgId)
    .eq("status", "pending")

  return (
    <div className="min-h-screen bg-stone-50">
      <SidebarNav
        items={NAV_ITEMS}
        userName={user.name}
        userRole={user.role}
        basePath="/dashboard"
        alertCount={alertCount ?? 0}
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
