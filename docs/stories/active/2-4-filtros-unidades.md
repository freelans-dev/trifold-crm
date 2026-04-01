# Story 2.4 — Filtros de Unidades

## Contexto
Com 108 unidades, filtros sao essenciais. O admin precisa encontrar rapidamente unidades disponiveis, o corretor precisa filtrar por tipologia e vista para sugerir ao cliente, e a Nicole precisa consultar unidades filtradas para responder perguntas como "tem apartamento de 2 suites com vista pra rua no andar alto?". Os filtros sao tanto na UI quanto na API (query params).

## Acceptance Criteria
- [ ] AC1: API `GET /api/properties/[propertyId]/units` aceita query params de filtro: `status`, `typology_id`, `floor_min`, `floor_max`, `view_direction`, `garage_count`, `garage_type`, `price_min`, `price_max`
- [ ] AC2: Filtros sao combinaveis (AND logic): ex. `status=available&floor_min=8&view_direction=frente`
- [ ] AC3: Filtro por status: `available`, `reserved`, `sold` (multiplos separados por virgula)
- [ ] AC4: Filtro por faixa de andar: `floor_min` e `floor_max`
- [ ] AC5: Filtro por vista: `view_direction` (frente, fundos, lateral, etc.)
- [ ] AC6: Filtro por garagem: `garage_count` (1, 2), `garage_type` (normal, coberta, etc.)
- [ ] AC7: Filtro por preco: `price_min`, `price_max` (apenas admin/supervisor/broker — RLS)
- [ ] AC8: Filtro por tipologia: `typology_id`
- [ ] AC9: UI de filtros na pagina de unidades: dropdowns/selects para cada filtro, botao "limpar filtros"
- [ ] AC10: Contadores atualizam ao filtrar (X disponiveis / Y total filtrado)
- [ ] AC11: Funcao helper `queryUnitsFiltered()` em `packages/db/` para reuso pelo modulo AI (Nicole)

## Detalhes Tecnicos

### Arquivos a criar/modificar:
- `packages/web/src/app/api/properties/[propertyId]/units/route.ts` — Adicionar query params de filtro
- `packages/web/src/components/properties/unit-filters.tsx` — Componente de filtros
- `packages/db/src/queries/units.ts` — Adicionar `queryUnitsFiltered(filters)` com builder de query
- `packages/shared/src/types/unit.ts` — Type `UnitFilters`

### Query builder pattern:
```typescript
export async function queryUnitsFiltered(
  supabase: SupabaseClient,
  propertyId: string,
  filters: UnitFilters
) {
  let query = supabase
    .from('units')
    .select('*, typology:typologies(*)')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (filters.status) query = query.in('status', filters.status);
  if (filters.floor_min) query = query.gte('floor', filters.floor_min);
  if (filters.floor_max) query = query.lte('floor', filters.floor_max);
  if (filters.view_direction) query = query.eq('view_direction', filters.view_direction);
  if (filters.typology_id) query = query.eq('typology_id', filters.typology_id);
  if (filters.garage_count) query = query.eq('garage_count', filters.garage_count);

  return query.order('floor', { ascending: true }).order('identifier');
}
```

### UI dos filtros:
- Barra horizontal acima da tabela de unidades
- Selects: Status | Tipologia | Vista | Garagem
- Inputs: Andar min-max | Preco min-max (admin only)
- Botao "Limpar filtros"
- Contadores: "Mostrando X de Y unidades"

## Dependencias
- Depende de: 2.3 (unidades existem)
- Bloqueia: Bloco 3 (Nicole usa filtros para responder sobre disponibilidade)

## Estimativa
M (Media) — 2 horas

## File List

### Created/Modified
- (nenhum arquivo implementado ainda)
