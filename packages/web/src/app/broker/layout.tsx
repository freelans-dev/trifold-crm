import Link from "next/link"
import Image from "next/image"
import { getServerUser } from "@web/lib/auth"
import { logout } from "@web/app/login/actions"
import { redirect } from "next/navigation"

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
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/broker" className="flex items-center gap-2">
              <Image src="/logo-trifold.webp" alt="Trifold" width={32} height={32} />
              <span className="text-lg font-bold text-orange-600">Trifold CRM</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/broker"
                className="text-gray-600 hover:text-gray-900"
              >
                Meus Leads
              </Link>
              <Link
                href="/broker/pipeline"
                className="text-gray-600 hover:text-gray-900"
              >
                Pipeline
              </Link>
              <Link
                href="/broker/agenda"
                className="text-gray-600 hover:text-gray-900"
              >
                Agenda
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
