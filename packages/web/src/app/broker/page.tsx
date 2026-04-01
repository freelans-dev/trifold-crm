import { getServerUser } from "@web/lib/auth"
import { logout } from "@web/app/login/actions"
import { redirect } from "next/navigation"

export default async function BrokerPage() {
  const user = await getServerUser()

  if (user.role !== "broker") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Painel do Corretor
            </h1>
            <p className="text-sm text-gray-500">Ola, {user.name}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
