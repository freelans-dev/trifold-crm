import { getServerUser } from "@web/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@web/components/layout/sidebar-nav"

const NAV_ITEMS = [
  { href: "/broker", label: "Meus Leads", icon: "◉" },
  { href: "/broker/pipeline", label: "Pipeline", icon: "▦" },
  { href: "/broker/agenda", label: "Agenda", icon: "▣" },
]

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (user.role !== "broker") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <SidebarNav
        items={NAV_ITEMS}
        userName={user.name}
        userRole={user.role}
        basePath="/broker"
      />

      <main className="lg:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
