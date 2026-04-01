# Requisitos do Catálogo de Empreendimentos e Unidades

## Contexto
O catálogo é core do sistema — a Nicole (agente IA) precisa dessas informações pra qualificar leads e os corretores precisam pra negociar. O painel admin precisa permitir edição fácil de tudo.

## Estrutura: Empreendimento → Tipologias → Unidades

### Nível 1: Empreendimento
- Nome (Vind, Yarden, etc.)
- Status (lançamento, em obras, entregue)
- Endereço completo
- Localização (lat/lng, link Google Maps)
- Conceito / proposta de valor
- Data de entrega prevista
- Total de unidades
- Total de andares (tipo + lazer + subsolo)
- Unidades por andar
- Fotos / renders (galeria)
- Vídeo tour (se tiver)
- Áreas de lazer (lista detalhada)
- Ficha técnica geral (estrutura, acabamentos padrão)
- Regras comerciais (exige entrada? valor mínimo? MCMV?)
- FAQ específico do empreendimento
- Materiais para envio (plantas PDF, renders, vídeos)

### Nível 2: Tipologia (modelo de planta)
- Nome da tipologia (ex: "2 suítes", "2 dorm + 1 suíte")
- Metragem privativa
- Metragem total
- Número de dormitórios
- Número de suítes
- Número de banheiros
- Sacada (sim/não, com churrasqueira?)
- Planta baixa (arquivo PDF/imagem)
- Planta humanizada (arquivo)
- Diferenciais da tipologia

### Nível 3: Unidade (cada apartamento individual)
- Identificação (ex: "1501", "Torre A - 801")
- Tipologia vinculada
- Andar
- Posição no andar (frente, fundos, lateral)
- Vista (rua, interna, bosque, nascente, poente, etc.)
- Número de vagas de garagem
- Tipo de garagem (normal, gaveta, dupla, coberta, descoberta)
- Metragem da garagem
- Metragem privativa (pode variar da tipologia por detalhes)
- Status: **disponível** / **reservado** / **vendido**
- Preço tabela (se aplicável — pode ser oculto da IA)
- Observações (ex: "unidade garden", "cobertura", "andar alto com vista privilegiada")

## Filtros necessários no painel
- Por empreendimento
- Por tipologia
- Por status (disponível / reservado / vendido)
- Por andar (faixa)
- Por vista
- Por número de garagens
- Por tipo de garagem
- Por faixa de preço (se visível)

## O que a Nicole (IA) pode acessar
- Tudo EXCETO: preço específico da unidade, memorial descritivo técnico detalhado
- Pode falar: metragem, número de quartos, vista, andar, garagem, lazer, localização, conceito
- Pode enviar: plantas, renders, fotos gerais
- NÃO pode: simular financiamento, prometer materiais de acabamento, dar preço exato

## O que o corretor vê
- Tudo incluindo preços e disponibilidade em tempo real
- Pode marcar unidade como reservada durante negociação
- Vê histórico de interesse dos leads por unidade específica

## Dados iniciais a cadastrar

### Vind
- 48 unidades, 4/andar, 12 pavimentos tipo
- 67m², 2 suítes, sacada ampla, churrasqueira a carvão
- 1 vaga coberta padrão
- Entrega: 1o semestre 2027

### Yarden
- 60 unidades, 4/andar, 15 pavimentos tipo
- Tipologia A: 83,66m² | Tipologia B: 79,81m²
- Opção 2 suítes OU 2 dorm + 1 suíte
- Garagem: 1 vaga (11,25m²) ou 2 vagas (22,50m²)
- Entrega: 1o semestre 2029
- Rooftop completo (fitness, sport bar, coworking, mirante)

### Dados que precisamos pedir à Trifold
- [ ] Mapa de unidades por andar (qual posição, qual vista)
- [ ] Diferença entre unidades (garagem normal vs gaveta)
- [ ] Quais unidades já estão vendidas/reservadas
- [ ] Preços por unidade (tabela interna)
- [ ] Plantas por tipologia (arquivos)
- [ ] Se existe diferença de preço por andar/vista
- [ ] Se Yarden tem unidades garden ou cobertura
