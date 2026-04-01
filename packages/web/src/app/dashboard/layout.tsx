import Link from "next/link"
import { getServerUser } from "@web/lib/auth"
import { logout } from "@web/app/login/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-orange-600">
              Trifold CRM
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/properties"
                className="text-gray-600 hover:text-gray-900"
              >
                Empreendimentos
              </Link>
              <Link
                href="/dashboard/pipeline"
                className="text-gray-600 hover:text-gray-900"
              >
                Pipeline
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user.name} ({user.role})
            </span>
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
