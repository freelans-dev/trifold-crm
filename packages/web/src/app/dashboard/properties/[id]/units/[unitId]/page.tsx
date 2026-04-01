"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface UnitData {
  id: string
  identifier: string
  floor: number
  position: string | null
  view_direction: string | null
  private_area_m2: number | null
  garage_count: number
  status: string
  price: number | null
  typology_id: string | null
  property: { id: string; name: string }
  typology: { id: string; name: string } | null
}

const viewLabels: Record<string, string> = {
  north: "Norte",
  south: "Sul",
  east: "Leste",
  west: "Oeste",
  northeast: "Nordeste",
  northwest: "Noroeste",
  southeast: "Sudeste",
  southwest: "Sudoeste",
}

const statusLabels: Record<string, string> = {
  available: "Disponivel",
  reserved: "Reservada",
  sold: "Vendida",
}

export default function UnitEditPage() {
  const routeParams = useParams<{ id: string; unitId: string }>()
  const router = useRouter()

  const propertyId = routeParams.id
  const unitId = routeParams.unitId

  const [unit, setUnit] = useState<UnitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [status, setStatus] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [floor, setFloor] = useState(0)
  const [price, setPrice] = useState<string>("")

  useEffect(() => {
    async function fetchUnit() {
      try {
        const res = await fetch(`/api/units/${unitId}`)
        if (!res.ok) {
          setError("Unidade nao encontrada")
          setLoading(false)
          return
        }
        const json = await res.json()
        const data = json.data as UnitData
        setUnit(data)
        setStatus(data.status)
        setIdentifier(data.identifier)
        setFloor(data.floor)
        setPrice(data.price != null ? String(data.price) : "")
      } catch {
        setError("Erro ao carregar unidade")
      }
      setLoading(false)
    }
    fetchUnit()
  }, [unitId])

  async function handleSave() {
    if (!unit) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const body: Record<string, unknown> = {}
      if (status !== unit.status) body.status = status
      if (identifier !== unit.identifier) body.identifier = identifier
      if (floor !== unit.floor) body.floor = floor
      const priceNum = price === "" ? undefined : Number(price)
      if (priceNum !== undefined && priceNum !== unit.price)
        body.price = priceNum

      if (Object.keys(body).length === 0) {
        setSuccess(true)
        setSaving(false)
        return
      }

      const res = await fetch(`/api/units/${unitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || "Erro ao salvar")
        setSaving(false)
        return
      }

      setSuccess(true)
      // Update local state
      const json = await res.json()
      setUnit((prev) => (prev ? { ...prev, ...json.data } : prev))
    } catch {
      setError("Erro ao salvar")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/properties/${propertyId}/units`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Voltar para unidades
        </Link>
        <p className="text-sm text-red-600">{error || "Unidade nao encontrada"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/properties/${propertyId}/units`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Voltar para unidades
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Unidade {unit.identifier}
        </h1>
        <p className="text-sm text-gray-500">{unit.property.name}</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Identifier */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Identificador
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Andar
            </label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Position (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Posicao
            </label>
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {unit.position ?? "-"}
            </p>
          </div>

          {/* View (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Vista
            </label>
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {unit.view_direction
                ? viewLabels[unit.view_direction] ?? unit.view_direction
                : "-"}
            </p>
          </div>

          {/* Area (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Area (m2)
            </label>
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {unit.private_area_m2 ?? "-"}
            </p>
          </div>

          {/* Garages (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Vagas de garagem
            </label>
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {unit.garage_count}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="available">{statusLabels.available}</option>
              <option value="reserved">{statusLabels.reserved}</option>
              <option value="sold">{statusLabels.sold}</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Preco (R$)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 450000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-sm text-green-600">Salvo com sucesso!</p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <Link
            href={`/dashboard/properties/${propertyId}/units`}
            className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}
