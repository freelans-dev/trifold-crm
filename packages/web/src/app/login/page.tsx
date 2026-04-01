"use client"

import { useActionState } from "react"
import Image from "next/image"
import { login } from "./actions"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await login(formData)
      return result ?? null
    },
    null
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          {/* Logo & Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
              <Image
                src="/logo-trifold.webp"
                alt="Trifold"
                width={40}
                height={40}
              />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              Trifold CRM
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              Entre com suas credenciais
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-stone-600"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-300 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-stone-600"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-300 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-stone-300">
          Trifold Engenharia — Maringa, PR
        </p>
      </div>
    </div>
  )
}
