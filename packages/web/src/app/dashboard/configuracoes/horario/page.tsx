import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"

const DAYS_OF_WEEK = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terca-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
] as const

interface DaySchedule {
  start: string
  end: string
  enabled: boolean
}

type BusinessHours = Record<string, DaySchedule>

const DEFAULT_HOURS: BusinessHours = {
  monday: { start: "09:00", end: "18:00", enabled: true },
  tuesday: { start: "09:00", end: "18:00", enabled: true },
  wednesday: { start: "09:00", end: "18:00", enabled: true },
  thursday: { start: "09:00", end: "18:00", enabled: true },
  friday: { start: "09:00", end: "18:00", enabled: true },
  saturday: { start: "09:00", end: "13:00", enabled: true },
  sunday: { start: "09:00", end: "13:00", enabled: false },
}

export default async function HorarioConfigPage() {
  const user = await getServerUser()
  const supabase = await createClient()

  const isAdmin = user.role === "admin"

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("id, business_hours")
    .eq("org_id", user.orgId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  const businessHours: BusinessHours = {
    ...DEFAULT_HOURS,
    ...((agentConfig?.business_hours as BusinessHours) ?? {}),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Horario de Atendimento
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure os horarios de funcionamento do atendimento automatico
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <form
          action={async (formData: FormData) => {
            "use server"
            const supabaseServer = await (
              await import("@web/lib/supabase/server")
            ).createClient()
            const { getServerUser: getUser } = await import("@web/lib/auth")
            const currentUser = await getUser()

            if (currentUser.role !== "admin") return

            const hours: BusinessHours = {}
            const days = [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ]

            for (const day of days) {
              hours[day] = {
                start: (formData.get(`${day}_start`) as string) || "09:00",
                end: (formData.get(`${day}_end`) as string) || "18:00",
                enabled: formData.get(`${day}_enabled`) === "on",
              }
            }

            // Check if config exists
            const { data: existing } = await supabaseServer
              .from("agent_config")
              .select("id")
              .eq("org_id", currentUser.orgId)
              .eq("is_active", true)
              .limit(1)
              .maybeSingle()

            if (existing) {
              await supabaseServer
                .from("agent_config")
                .update({ business_hours: hours })
                .eq("id", existing.id)
            } else {
              await supabaseServer.from("agent_config").insert({
                org_id: currentUser.orgId,
                business_hours: hours,
              })
            }
          }}
        >
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const day = businessHours[key] ?? DEFAULT_HOURS[key]
              return (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-md border border-gray-200 p-4"
                >
                  <label className="flex w-40 items-center gap-2">
                    <input
                      type="checkbox"
                      name={`${key}_enabled`}
                      defaultChecked={day.enabled}
                      disabled={!isAdmin}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name={`${key}_start`}
                      defaultValue={day.start}
                      disabled={!isAdmin}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                    />
                    <span className="text-sm text-gray-500">ate</span>
                    <input
                      type="time"
                      name={`${key}_end`}
                      defaultValue={day.end}
                      disabled={!isAdmin}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {isAdmin && (
            <div className="mt-6">
              <button
                type="submit"
                className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Salvar horarios
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
