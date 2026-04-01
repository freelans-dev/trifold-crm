import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PropertyUnitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const filters = await searchParams
  await getServerUser()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!property) notFound()

  const { data: typologies } = await supabase
    .from("typologies")
    .select("id, name")
    .eq("property_id", id)
    .eq("is_active", true)
    .order("name")

  let query = supabase
    .from("units")
    .select(
      `id, identifier, floor, position, view_direction, garage_count,
       private_area_m2, status, typology_id,
       typology:typology_id(name)`
    )
    .eq("property_id", id)
    .eq("is_active", true)

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.floor_min) {
    query = query.gte("floor", parseInt(filters.floor_min))
  }

  if (filters.floor_max) {
    query = query.lte("floor", parseInt(filters.floor_max))
  }

  if (filters.typology_id) {
    query = query.eq("typology_id", filters.typology_id)
  }

  if (filters.view_direction) {
    query = query.eq("view_direction", filters.view_direction)
  }

  if (filters.garage_count) {
    query = query.eq("garage_count", parseInt(filters.garage_count))
  }

  const { data: units } = await query
    .order("floor")
    .order("identifier")

  const allUnitsQuery = await supabase
    .from("units")
    .select("status")
    .eq("property_id", id)
    .eq("is_active", true)

  const allUnits = allUnitsQuery.data ?? []
  const availableCount = allUnits.filter((u) => u.status === "available").length
  const reservedCount = allUnits.filter((u) => u.status === "reserved").length
  const soldCount = allUnits.filter((u) => u.status === "sold").length

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/properties/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; {property.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Unidades - {property.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {availableCount} disponiveis / {reservedCount} reservadas / {soldCount} vendidas
        </p>
      </div>

      {/* Filter Controls */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <form className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Status</label>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="available">Disponivel</option>
              <option value="reserved">Reservada</option>
              <option value="sold">Vendida</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Andar min</label>
            <input
              type="number"
              name="floor_min"
              defaultValue={filters.floor_min ?? ""}
              placeholder="Min"
              className="mt-1 w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Andar max</label>
            <input
              type="number"
              name="floor_max"
              defaultValue={filters.floor_max ?? ""}
              placeholder="Max"
              className="mt-1 w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Tipologia</label>
            <select
              name="typology_id"
              defaultValue={filters.typology_id ?? ""}
              className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">Todas</option>
              {typologies?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Vista</label>
            <select
              name="view_direction"
              defaultValue={filters.view_direction ?? ""}
              className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">Todas</option>
              <option value="north">Norte</option>
              <option value="south">Sul</option>
              <option value="east">Leste</option>
              <option value="west">Oeste</option>
              <option value="northeast">Nordeste</option>
              <option value="northwest">Noroeste</option>
              <option value="southeast">Sudeste</option>
              <option value="southwest">Sudoeste</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Vagas</label>
            <input
              type="number"
              name="garage_count"
              defaultValue={filters.garage_count ?? ""}
              placeholder="Qtd"
              className="mt-1 w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            Filtrar
          </button>

          <Link
            href={`/dashboard/properties/${id}/units`}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </Link>
        </form>
      </div>

      {/* Units Table */}
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">
          Unidades ({units?.length ?? 0})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2">Unidade</th>
                <th className="px-4 py-2">Andar</th>
                <th className="px-4 py-2">Posicao</th>
                <th className="px-4 py-2">Vista</th>
                <th className="px-4 py-2">Area</th>
                <th className="px-4 py-2">Vagas</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Tipologia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {units?.map((u) => {
                const typology = u.typology as unknown as { name: string } | null
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{u.identifier}</td>
                    <td className="px-4 py-2">{u.floor}</td>
                    <td className="px-4 py-2">{u.position ?? "-"}</td>
                    <td className="px-4 py-2">{u.view_direction ?? "-"}</td>
                    <td className="px-4 py-2">
                      {u.private_area_m2 ? `${u.private_area_m2}m2` : "-"}
                    </td>
                    <td className="px-4 py-2">{u.garage_count}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === "available"
                            ? "bg-green-100 text-green-700"
                            : u.status === "reserved"
                            ? "bg-yellow-100 text-yellow-700"
                            : u.status === "sold"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.status === "available"
                          ? "Disponivel"
                          : u.status === "reserved"
                          ? "Reservada"
                          : u.status === "sold"
                          ? "Vendida"
                          : u.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {typology?.name ?? "-"}
                    </td>
                  </tr>
                )
              })}
              {(!units || units.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Nenhuma unidade encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
