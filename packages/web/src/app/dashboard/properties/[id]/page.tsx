import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await getServerUser()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!property) notFound()

  const [{ data: typologies }, { data: units }] = await Promise.all([
    supabase
      .from("typologies")
      .select("*")
      .eq("property_id", id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("units")
      .select("id, identifier, floor, position, view_direction, garage_count, private_area_m2, status, typology_id")
      .eq("property_id", id)
      .eq("is_active", true)
      .order("floor")
      .order("identifier"),
  ])

  const availableCount = units?.filter((u) => u.status === "available").length ?? 0
  const reservedCount = units?.filter((u) => u.status === "reserved").length ?? 0
  const soldCount = units?.filter((u) => u.status === "sold").length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/properties"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Empreendimentos
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {property.name}
          </h1>
          <p className="text-sm text-gray-500">
            {property.address}, {property.city}/{property.state}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            property.status === "selling"
              ? "bg-green-100 text-green-700"
              : property.status === "launching"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {property.status === "selling"
            ? "Em venda"
            : property.status === "launching"
            ? "Lancamento"
            : property.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{units?.length ?? 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Disponiveis</p>
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Reservadas</p>
          <p className="text-2xl font-bold text-yellow-600">{reservedCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Vendidas</p>
          <p className="text-2xl font-bold text-blue-600">{soldCount}</p>
        </div>
      </div>

      {/* Concept & Details */}
      {property.concept && (
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Conceito</h2>
          <p className="text-gray-600">{property.concept}</p>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && (property.amenities as string[]).length > 0 && (
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Amenidades</h2>
          <div className="flex flex-wrap gap-2">
            {(property.amenities as string[]).map((a, i) => (
              <span
                key={i}
                className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Typologies */}
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Tipologias</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {typologies?.map((t) => (
            <div key={t.id} className="rounded-md border p-4">
              <p className="font-medium text-gray-900">{t.name}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                {t.private_area_m2 && <span>{t.private_area_m2}m2</span>}
                {t.bedrooms && <span>{t.bedrooms} quartos</span>}
                {t.suites && <span>{t.suites} suites</span>}
                {t.has_balcony && <span>Sacada</span>}
                {t.balcony_bbq && <span>Churrasqueira</span>}
              </div>
              {t.description && (
                <p className="mt-2 text-sm text-gray-500">{t.description}</p>
              )}
            </div>
          ))}
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {units?.map((u) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
