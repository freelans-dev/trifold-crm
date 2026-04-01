# Project Brief -- Trifold CRM (Nicole)

**Versao:** 1.0
**Data:** 31/03/2026
**Autor:** @analyst (Atlas) -- AIOS Pipeline
**Base:** Reunioes presenciais 30/03 e 31/03/2026, base de conhecimento NLU, projeto agente-linda
**Proximo passo:** @pm (Morgan) cria o PRD a partir deste brief

---

## 1. Visao do Produto

O **Trifold CRM** e uma plataforma de CRM imobiliario com agente de IA conversacional (Nicole), desenvolvida especificamente para a Trifold Engenharia de Maringa-PR. O sistema combina um agente inteligente via Telegram (migrando para WhatsApp/Z-API) que qualifica leads, responde duvidas sobre empreendimentos e agenda visitas ao stand de vendas, com um CRM completo que oferece pipeline kanban, supervisao de conversas em tempo real, painel do corretor e rastreamento de campanhas.

**Para quem:**
- **Supervisores/gestao** (Alexandre, Lucas/Marcao) -- painel admin, treinamento da IA, monitoramento de conversas, metricas
- **Corretores internos** (equipe Trifold) -- pipeline proprio, leads designados, resumo IA, feedback pos-visita
- **Leads/clientes** -- atendimento 24/7 via chat, qualificacao automatica, agendamento de visitas

**Problema que resolve:**
A Trifold tem um gargalo critico no atendimento de leads. Com o lancamento do Yarden (60 unidades) previsto para julho/2026, uma base de 1.000+ leads parados sem nutricao, e 4 tentativas fracassadas de chatbot (incluindo Zenvia atual a R$1.000+/mes sem resultado), a empresa precisa de uma solucao que entenda as peculiaridades do mercado imobiliario: ciclo de venda longo, fechamento presencial obrigatorio, necessidade de despertar interesse sem saciar curiosidade, e qualificacao rigorosa antes do transbordo ao corretor.

**Proposta de valor unica:**
Agente IA conversacional construido especificamente para o mercado imobiliario, com guardrails que impedem exposicao de informacoes sensiveis (memorial descritivo, simulacao financeira), estrategia de qualificacao que filtra leads sem entrada, e CRM proprio que da controle total sobre conversas e dados -- diferente de bots genericos que ja falharam 4 vezes.

---

## 2. Contexto e Motivacao

### Situacao atual da Trifold
- Construtora/incorporadora fundada em 2019, equipe tecnica com experiencia desde 1997
- Transicao de obras corporativas B2B (Coca-Cola, Unimed) para incorporacao propria de alto padrao
- 3 empreendimentos ativos: Vind (em comercializacao), Yarden (lancamento 2026), e um terceiro em aprovacao
- Equipe comercial enxuta, score de maturidade digital: **1.8/5**
- CRM atual: Supremo (subutilizado, sem integracao com atendimento)
- Canal principal: WhatsApp (numero unico da recepcionista)

### 4 tentativas fracassadas de chatbot
1. **Empresa terceira (nao nomeada)** -- bot obvio, "botzinho" de fluxo pre-definido
2. **ChatGPT** -- "nao responder o que precisava, muito tecnica"
3. **Lais** (R$1.400/mes) -- **gostavam bastante**, simples e eficaz, tinha CRM integrado. Removida por orientacao de consultoria externa ("achavam caro"). Problema: transbordo desestruturado, sem integracao com Supremo
4. **Zenvia** (R$1.000+/mes, 3 meses) -- bot obvio, sem formatacao, nao envia arquivos, nao qualifica, nao entende mercado imobiliario. **Insatisfeitos.**

> "Ja e a quarta vez" -- frustracao acumulada, ceticismo alto. Precisa funcionar de primeira.

### Lancamento Yarden -- deadline
- **60 unidades** em lancamento previsto para **julho/2026**
- Empreendimento de alto padrao com rooftop exclusivo
- MVP do agente precisa estar rodando **antes** do lancamento
- Alexandre: "Eu tenho urgencia para isso. Eu tenho que parar todo o processo ja."

### Base de 1.000+ leads parados
- Leads acumulados de campanhas anteriores sem nutricao
- "Essa nutricao dessas pessoas que estao paradas, pra nos e deixar de andar mesmo. Nao falar, nao alimentar."
- Reativacao dessa base e receita dormindo

### Mercado de Maringa
- **Boom historico:** 109 predios em construcao, 11.933 apartamentos em obras
- **3a cidade do Brasil** em valorizacao imobiliaria (ate 1,55%/mes)
- Concorrencia massiva: Plaenge (6a maior do Brasil), A.Yoshii (10a maior)
- Para construtora do porte da Trifold, diferenciacao e eficiencia operacional sao questao de sobrevivencia

---

## 3. Stakeholders

### Mapa de Stakeholders

| Papel | Nome | Funcao | Nivel de engajamento | Modulos que usa |
|-------|------|--------|---------------------|-----------------|
| **Decision Maker** | Alexandre Guimaraes Nicolau | Socio-administrador, comercial/estrategico | MUITO ALTO -- champion principal | Painel admin, dashboard analytics |
| **Champion Operacional** | Lucas/Marcao | Comercial/operacional, supervisao de vendas | MUITO ALTO -- operadores reais | Painel admin, supervisao, treinamento IA, pipeline |
| **Stakeholder Financeiro** | Robson | Socio/financeiro | MEDIO -- presente mas pouco vocal | Dashboard analytics, custos |
| **Stakeholder Tecnico** | Caio Augusto | Administrador, engenharia/obras | ALTO -- ja experimenta IA por conta | Potencial usuario futuro de analytics |
| **Socio** | Belino Sezini | Socio | N/A -- nao presente nas reunioes | N/A |
| **Usuarios Finais** | Corretores internos | Atendimento de leads qualificados | A definir | Painel corretor, pipeline, conversas |
| **Consultor/Dev** | Gabriel (Reche Inc) | Consultoria + desenvolvimento | ALTO | Todos (setup e treinamento) |

### Quem usa cada modulo

| Modulo | Usuarios |
|--------|----------|
| Agente Nicole (conversa com leads) | Automatico -- leads interagem via chat |
| Painel Administrativo | Alexandre, Lucas/Marcao |
| Supervisao de conversas | Lucas/Marcao |
| Painel do Corretor | Corretores internos |
| Pipeline/Kanban | Lucas/Marcao, corretores |
| Dashboard Analytics | Alexandre, Robson |
| Treinamento da IA | Lucas/Marcao |

---

## 4. Escopo MVP (Fase 1)

### MUST HAVE (obrigatorio no MVP)

| # | Feature | Descricao | Justificativa |
|---|---------|-----------|---------------|
| M1 | **Agente conversacional (Telegram)** | Bot Nicole no Telegram, qualifica leads, responde FAQ, agenda visitas | Core do projeto -- prioridade #1 unanime |
| M2 | **Base de conhecimento dos empreendimentos** | Cadastro de info dos predios (Vind, Yarden), FAQ, diferenciais, localizacao | Alimenta o agente -- sem isso nao funciona |
| M3 | **Qualificacao de leads** | Coleta nome, interesse, entrada disponivel, preferencias. Sem entrada = nao qualifica pro Yarden | Regra de negocio critica definida por Alexandre |
| M4 | **Handoff para corretor** | Transbordo transparente (lead nao percebe), corretor assume no numero Trifold | Core -- "primeiro e o conversacional" |
| M5 | **Guardrails da IA** | Nao prometer materiais, nao simular financeiro, nao expor memorial descritivo | Risco juridico -- regra critica |
| M6 | **Pipeline de leads basico** | Kanban com etapas: novo, qualificado, agendado, visitou, negociando, fechou, perdido | Gestao minima dos leads |
| M7 | **Painel admin basico** | Treinamento da IA, gestao de base de conhecimento, config do agente | Equipe precisa controlar o agente |
| M8 | **Registro de conversas** | Historico completo de todas as conversas (agente + corretor) | Alexandre: "Eu tenho que ter controle sobre isso" |
| M9 | **Horario comercial** | Mensagens fora do horario, config de funcionamento | Basico operacional |

### SHOULD HAVE (desejavel no MVP, pode entrar na Fase 2)

| # | Feature | Descricao | Justificativa |
|---|---------|-----------|---------------|
| S1 | **Supervisao em tempo real** | Supervisor acompanha conversas, pode intervir, enviar instrucoes ao corretor | Definido como CORE na reuniao, mas pode ser simplificado |
| S2 | **Painel do corretor simplificado** | Lista de leads designados, historico de conversa, resumo IA do lead | Corretores precisam de contexto |
| S3 | **Envio de materiais visuais** | Agente envia plantas, renders, fotos do empreendimento | Leads pedem -- Zenvia nao conseguia fazer isso |
| S4 | **Agendamento de visitas** | Propor horario, confirmar, notificar corretor | Fluxo natural da qualificacao |
| S5 | **Designacao de leads a corretores** | Por empreendimento/especialidade | Roteamento basico |

### COULD HAVE (Fase 2-3)

| # | Feature | Descricao |
|---|---------|-----------|
| C1 | **Rastreamento de origem (Meta Ads)** | UTM params, campanha -> lead -> conversao |
| C2 | **Dashboard analytics** | Metricas de conversao, performance por corretor/campanha |
| C3 | **Follow-up pos-visita** | Agente pergunta ao corretor feedback, audio -> transcricao IA |
| C4 | **Nutricao de leads frios** | Reativar base de 1.000+ leads com campanhas automatizadas |
| C5 | **Monitoramento de conversas do corretor** | Z-API multi-instancia, escutar numeros dos corretores |
| C6 | **Coaching de corretores via IA** | Analise de conversas, feedback automatizado |
| C7 | **Geracao de criativos integrada** | Reche Studio para conteudo visual |
| C8 | **Migracao Telegram -> WhatsApp/Z-API** | Quando pronto para producao real |

### O que NAO entra no MVP (explicito)

| Exclusao | Motivo |
|----------|--------|
| Integracao com CRM Supremo | Decisao consensual -- CRM proprio substitui |
| App mobile nativo | Gabriel recomendou evitar app stores -- web + chat resolve |
| Simulacao financeira pela IA | Regra de negocio -- depende do perfil do cliente, corretor faz |
| Envio de memorial descritivo | Risco juridico -- materiais podem mudar durante obra |
| Pos-venda e assistencia tecnica | Fora do escopo comercial |
| ERP / gestao de obra | Outro dominio, outro projeto |
| Integracao com portais (Viva Real, Chaves na Mao) | Fase futura |
| Voz sintetica para ligacoes | Fase futura, apesar do interesse |

---

## 5. Arquitetura Tecnica

### Stack

| Camada | Tecnologia | Observacao |
|--------|-----------|------------|
| **Frontend** | Next.js 16 + React 19 | Reuso do agente-linda |
| **Backend/API** | Next.js API Routes + Server Actions | Monorepo |
| **Banco de dados** | Supabase (PostgreSQL + pgvector + RLS) | Conta nova, schema adaptado |
| **IA** | Claude (Sonnet para conversas, Haiku para tarefas leves) | RAG com pgvector |
| **Chat (MVP)** | Telegram Bot API | Inicio rapido, sem custo de API |
| **Chat (producao)** | Z-API (WhatsApp) | Migracao pos-MVP |
| **Hosting** | Vercel (web) + VPS (bot Telegram) | Auto-deploy via push to main |
| **Auth** | Supabase Auth | Multi-tenant ready |
| **Storage** | Supabase Storage | Plantas, renders, fotos |

### Monorepo Structure (baseado no agente-linda)

```
trifold-crm/
├── packages/
│   ├── web/          # Next.js 16 -- dashboard admin, painel corretor
│   ├── ai/           # Claude client, prompts, guardrails, RAG, sales flow
│   ├── db/           # Supabase client, migrations, types, RLS policies
│   ├── bot/          # Telegram bot (MVP) / Z-API adapter (futuro)
│   └── shared/       # Types, utils, constants compartilhados
├── supabase/         # Migrations, seed data, edge functions
├── docs/             # PRD, stories, research
└── turbo.json        # Turborepo config
```

### Integracoes

| Integracao | Fase | Descricao |
|-----------|------|-----------|
| **Telegram Bot API** | MVP | Recebe/envia mensagens, comandos, inline keyboards |
| **Z-API** | Fase 2 | WhatsApp oficial Trifold + numeros dos corretores (multi-instancia) |
| **Supabase Realtime** | MVP | Supervisao em tempo real de conversas |
| **Google Calendar** | MVP/Fase 2 | Agendamento de visitas (reuso do agente-linda) |
| **Meta Ads API** | Fase 2 | Webhook receiver, UTM tracking, API de conversoes |
| **Supabase Storage** | MVP | Upload/envio de plantas e materiais visuais |

### Infraestrutura

| Componente | Servico | Custo estimado |
|-----------|---------|---------------|
| Web app | Vercel (Pro) | ~$20/mes |
| Bot Telegram | VPS (Hetzner/Railway) | ~$5-10/mes |
| Banco de dados | Supabase (Pro) | ~$25/mes |
| IA (tokens Claude) | Anthropic API | Variavel (~$50-150/mes dependendo do volume) |
| Z-API (futuro) | Z-API (por instancia) | ~R$50-100/mes por numero |

---

## 6. Modelo de Dados (alto nivel)

### Entidades Principais

```
organizations
├── id, name, slug, logo, settings, billing
├── HAS MANY → users (corretores, admins, supervisores)
├── HAS MANY → properties (empreendimentos)
├── HAS MANY → leads
├── HAS MANY → conversations
└── HAS MANY → pipeline_stages

users (corretores, admins)
├── id, org_id, name, email, role (admin/supervisor/broker)
├── phone_number (numero Trifold do corretor)
├── assigned_properties[] (empreendimentos que atende)
└── HAS MANY → lead_assignments

properties (empreendimentos)
├── id, org_id, name, slug, status (lancamento/comercializacao/entregue)
├── address, neighborhood, city, lat, lng
├── description, concept, differentials[]
├── delivery_date, total_units
├── amenities[] (areas de lazer)
├── faq[] (perguntas e respostas aprovadas)
├── restrictions[] (o que a IA NAO pode dizer)
├── HAS MANY → units
├── HAS MANY → floor_plans (plantas/tipologias)
└── HAS MANY → media (fotos, renders)

units (unidades)
├── id, property_id, number, floor
├── typology (2 suites, 3 dorm, etc.)
├── area_private, area_total
├── parking_spots, view, orientation
├── status (disponivel/reservado/vendido)
└── price_range (faixa, nao valor exato)

leads
├── id, org_id, name, phone, email
├── source (meta_ads/site/indicacao/reativacao)
├── utm_campaign, utm_source, utm_medium, utm_content
├── property_interest_id (FK → properties)
├── qualification_status (pending/qualified/disqualified)
├── has_down_payment (boolean -- qualificacao Yarden)
├── preferences (bedrooms, floor, view, parking)
├── pipeline_stage_id (FK → pipeline_stages)
├── assigned_broker_id (FK → users)
├── ai_summary (resumo gerado pela IA)
└── HAS MANY → conversations

conversations
├── id, lead_id, org_id
├── channel (telegram/whatsapp)
├── status (active/handed_off/closed)
├── handed_off_to (FK → users)
├── handed_off_at
└── HAS MANY → messages

messages
├── id, conversation_id
├── sender_type (ai/lead/broker/supervisor)
├── sender_id
├── content, media_url, media_type
├── metadata (confidence_score, intent, etc.)
└── created_at

pipeline_stages
├── id, org_id, name, order, color
└── HAS MANY → leads

agent_config
├── id, org_id
├── personality, tone, language
├── business_hours, off_hours_message
├── handoff_rules, qualification_rules
├── model (sonnet/haiku), temperature
└── guardrails[] (restricoes ativas)

knowledge_base
├── id, org_id, property_id (opcional)
├── category (faq/differentials/location/payment)
├── question, answer
├── embedding (pgvector)
├── is_active, priority
└── restrictions (o que NAO dizer nesse contexto)

activities / activity_log
├── id, org_id, lead_id, user_id
├── type (note/call/visit/status_change/handoff)
├── content, metadata
└── created_at
```

### Relacionamentos Chave

- **Organization** e a raiz (multi-tenant, pensando em escala futura)
- **Lead** pertence a uma **Organization** e pode ter interesse em um **Property**
- **Lead** tem um **pipeline_stage** e pode estar atribuido a um **User** (corretor)
- **Conversation** conecta **Lead** com historico de **Messages**
- **Knowledge Base** alimenta o RAG do agente, vinculada a **Property** ou geral
- **Units** pertencem a **Properties** com status individual (disponivel/vendida)
- **Agent Config** e por organizacao, permitindo customizacao

---

## 7. Fluxo Principal

```
                    ┌─────────────────────────┐
                    │   Lead ve anuncio        │
                    │   (Meta Ads / Instagram)  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Entra em contato       │
                    │   via Telegram (MVP)     │
                    │   ou WhatsApp (futuro)   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Nicole (Agente IA)     │
                    │   recepciona com         │
                    │   simpatia e empatia     │
                    └──────────┬──────────────┘
                               │
                    ┌──────────┴──────────────┐
                    │                         │
                    ▼                         ▼
          ┌─────────────────┐     ┌────────────────────┐
          │  Identifica      │     │  Responde FAQ      │
          │  empreendimento  │     │  (localizacao,     │
          │  de interesse    │     │   conceito, prazo, │
          │  (Vind/Yarden)   │     │   diferenciais)    │
          └────────┬────────┘     └────────┬───────────┘
                   │                       │
                   └───────────┬───────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   QUALIFICA O LEAD      │
                    │   - Tem entrada? (*)    │
                    │   - Interesse real?     │
                    │   - Perfil compativel?  │
                    │   - Preferencias        │
                    └──────────┬──────────────┘
                               │
                    ┌──────────┴──────────────┐
                    │                         │
                    ▼                         ▼
          ┌─────────────────┐     ┌────────────────────┐
          │  QUALIFICADO    │     │  NAO QUALIFICADO   │
          │                 │     │                    │
          │  Agenda visita  │     │  Registra no       │
          │  ao stand       │     │  pipeline como     │
          │                 │     │  "nao qualificado" │
          └────────┬────────┘     │  Nutre depois (F3) │
                   │              └────────────────────┘
                   ▼
          ┌─────────────────────────────────┐
          │   HANDOFF (transbordo)          │
          │   - Transparente pro lead      │
          │   - Corretor recebe resumo IA  │
          │   - Corretor usa numero Trifold│
          └────────┬────────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────────┐
          │   CORRETOR ATENDE               │
          │   - Supervisor monitora         │
          │   - Pode receber instrucoes     │
          │   - Agenda visita ao stand      │
          └────────┬────────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────────┐
          │   VISITA AO STAND               │
          │   - Conhece decorado            │
          │   - Simulacao financeira        │
          │   - Fechamento presencial       │
          └────────┬────────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────────┐
          │   FOLLOW-UP POS-VISITA (F2)     │
          │   - Agente pergunta ao corretor │
          │   - Corretor grava audio        │
          │   - IA transcreve e alimenta    │
          │     o pipeline                  │
          └─────────────────────────────────┘

(*) Sem entrada = nao qualifica para o Yarden (regra Alexandre)
```

---

## 8. Regras de Negocio Criticas

### O que a IA NAO pode fazer

| Restricao | Motivo | Severidade |
|-----------|--------|-----------|
| **NAO prometer materiais/acabamentos especificos** | Memorial descritivo pode mudar durante obra; risco juridico | CRITICA |
| **NAO fazer simulacao financeira detalhada** | Depende do perfil do cliente (renda, entrada); corretor e especialista | CRITICA |
| **NAO expor memorial descritivo tecnico** | Informacao sensivel que gera expectativa juridica | CRITICA |
| **NAO enviar tabela de precos exata** | Valores variam por unidade, andar, garagem | ALTA |
| **NAO dizer que e um bot/IA** | Transbordo precisa ser transparente | ALTA |

### Regras de qualificacao

| Regra | Aplicacao | Definida por |
|-------|-----------|-------------|
| **Sem entrada = nao qualifica para Yarden** | Lead sem entrada disponivel nao vai pro corretor no Yarden | Alexandre |
| **Formas de pagamento: informar padrao generico** | "Entrada + parcelas, condicoes flexiveis" -- sem valores especificos | Lucas |
| **Quanto mais info = menos visita** | IA informa o suficiente para despertar interesse, NAO para saciar curiosidade | Lucas/Marcao (dado historico) |

### Regras operacionais

| Regra | Descricao | Motivo |
|-------|-----------|--------|
| **Corretor usa numero Trifold** | Nunca o pessoal -- se corretor sair, dados ficam na empresa | Alexandre |
| **Conversas 100% registradas** | Todo historico (agente + corretor + supervisor) fica no sistema | Alexandre: "controle total" |
| **Transbordo transparente** | Cliente nao percebe que mudou de atendente | Experiencia do usuario |
| **Fechamento so presencial** | "Indice de fechamento so acontece aqui dentro" -- natureza do mercado | Lucas |

### Estrategia de comunicacao da Nicole

| Diretriz | Descricao |
|----------|-----------|
| **Personalidade** | Simpatica, "boa praca", natural -- nao robotica |
| **Estrategia** | Despertar interesse sem saciar curiosidade |
| **Gatilhos** | Convidar para visita com diferencial ("venha tomar um cafe", "conheca o decorado") |
| **Tom** | Informar o suficiente para gerar desejo de visitar, nunca o bastante para o lead decidir sem vir |
| **Redirecionar para visita** | Sempre que possivel, direcionar a conversa para agendamento de visita presencial |

---

## 9. Dados dos Empreendimentos

### Vind Residence

| Atributo | Dado |
|----------|------|
| **Nome** | Vind Residence |
| **Conceito** | Apartamento boutique / compacto de luxo |
| **Endereco** | Rua Jose Pereira da Costa, 547 |
| **Bairro** | Jd. Novo Horizonte (proximo Cerro Azul e Nildo Ribeiro) |
| **Cidade** | Maringa-PR |
| **Proximidades** | 6 min da Unicesumar, 5 min da Catedral |
| **Total de unidades** | 48 |
| **Unidades por andar** | 4 |
| **Pavimentos tipo** | 12 |
| **Subsolos de garagem** | 2 |
| **Terreo** | 1 pavimento de lazer |
| **Total de andares** | 15 (2 sub + 1 terreo + 12 tipo) |
| **Metragem** | 67 m2 (area privativa) |
| **Tipologia** | 2 suites |
| **Diferenciais** | Sacada ampla, churrasqueira a carvao |
| **Entrega** | 1o semestre de 2027 |
| **Status** | Em comercializacao |
| **CNPJ filial** | 35.814.530/0002-39 |
| **Lazer** | Area gourmet, piscina, academia, salao de festas, playground, portaria 24h |

### Yarden

| Atributo | Dado |
|----------|------|
| **Nome** | Yarden |
| **Conceito** | Alto padrao biofilico -- "Onde a Natureza encontra Sofisticacao" |
| **Endereco** | Rua Carlos Meneghetti, 168 |
| **Bairro** | Gleba Itororo (Jd. Cerro Azul) |
| **Cidade** | Maringa-PR |
| **Proximidades** | 400m do Bosque 2 |
| **Total de unidades** | 60 |
| **Unidades por andar** | 4 |
| **Pavimentos tipo** | 15 |
| **Subsolos de garagem** | 2 |
| **Pavimentos de lazer** | 2 (terreo + rooftop) |
| **Total de andares** | 19 (2 sub + 2 lazer + 15 tipo) |
| **Metragem** | 79,81 m2 e 83,66 m2 |
| **Tipologias** | Opcao 2 dormitorios (2 suites) ou 3 dormitorios (2 dorm + 1 suite) |
| **Entrega** | 1o semestre de 2029 |
| **Status** | Lancamento (julio/2026) |
| **Exige entrada** | SIM -- obrigatoria (regra de qualificacao) |

**Lazer Rooftop:** Fitness, gym outdoor, sport bar, coworking, sala de reunioes

**Lazer Terreo:** Piscina, salao de festas, area gourmet, brinquedoteca, pet place, miniquadra

### Comparativo Rapido

| | Vind | Yarden |
|---|------|--------|
| Unidades | 48 | 60 |
| Metragem | 67 m2 | 79-84 m2 |
| Quartos | 2 suites | 2 ou 3 dorm |
| Andares tipo | 12 | 15 |
| Lazer | 1 pavimento (terreo) | 2 pavimentos (terreo + rooftop) |
| Entrega | 1o sem 2027 | 1o sem 2029 |
| Status | Comercializacao | Lancamento jul/2026 |
| Entrada obrigatoria | Nao especificado | SIM |

---

## 10. Reuso do agente-linda

### O que reaproveitar (~70%)

| Componente agente-linda | Adaptacao para Trifold |
|------------------------|----------------------|
| **Agent engine** (core.ts, claude-client.ts) | Adaptar prompts e fluxo para imobiliario |
| **Prompt builder + loader** | Criar prompts especificos da Nicole |
| **Guardrails** | Configurar restricoes do mercado imobiliario |
| **Sales flow** | Adaptar funil para jornada imobiliaria (visita presencial) |
| **Handoff / consultant router** | Adaptar para roteamento a corretores por empreendimento |
| **Data extractor** | Adaptar campos para perfil imobiliario (entrada, quartos, andar) |
| **Confidence scorer** | Calibrar thresholds para mercado imobiliario |
| **History summarizer** | Reuso direto |
| **Knowledge base / RAG** (pgvector) | Alimentar com dados dos empreendimentos |
| **Training interface** | Reuso direto |
| **Dashboard** | Adaptar layout e metricas |
| **Pipeline / Kanban** | Adaptar etapas para funil imobiliario |
| **Leads management** | Adaptar campos para mercado imobiliario |
| **Business hours** | Reuso direto |
| **Notification service** | Reuso direto |
| **Model selector** (Sonnet/Haiku) | Reuso direto |
| **Analytics dashboard** | Adaptar metricas |
| **Bookings / agendamento** (Google Calendar) | Adaptar para visitas ao stand |
| **Handoffs management** | Reuso direto |
| **Broadcasts** | Reuso direto (Fase 3) |
| **Catalog** | Adaptar de produtos para empreendimentos/unidades |
| **Settings** | Reuso direto |
| **Supabase infra** (migrations, RLS, auth) | Adaptar schema |
| **Monorepo structure** (Turborepo) | Reuso direto |

### O que construir novo (~30%)

| Componente | Motivo |
|-----------|--------|
| **Modelo de dados imobiliario** (properties, units, floor_plans) | Entidades especificas do mercado |
| **Logica de qualificacao imobiliaria** (entrada, perfil, programa habitacional) | Regras de negocio da Trifold |
| **Adapter Telegram** (bot MVP) | agente-linda usa Z-API direto, Trifold comeca por Telegram |
| **Tracking de origem (Meta Ads)** | Nao existe no agente-linda |
| **Monitoramento de conversas do corretor** (Z-API multi-instancia) | Escutar numeros dos corretores |
| **Supervisao em tempo real com intervencao** | Nivel mais avancado que o handoff atual |
| **Follow-up pos-visita** (audio -> transcricao) | Fluxo novo especifico do presencial |
| **Painel do corretor simplificado** | Visao diferente do dashboard admin |
| **Guardrails imobiliarios** (memorial, simulacao, materiais) | Restricoes especificas |
| **Designacao inteligente de leads** (por empreendimento/especialidade) | Logica nova de roteamento |

### Estimativa de reuso
- **Arquitetura (monorepo, Supabase, Next.js):** 100% reusavel
- **Motor de IA (Claude, RAG, prompts, guardrails):** 80% reusavel com adaptacao de prompts
- **Dashboard/UI (pipeline, leads, settings):** 70% reusavel com adaptacao de campos
- **Logica de negocio:** 30% reusavel -- mercado imobiliario tem peculiaridades unicas
- **Integracao de chat:** Novo (Telegram adapter), mas Z-API ja existe para futuro

---

## 11. Timeline

### Fase 0 -- Setup (31/03 -> 04/04)
- [x] Reunioes de levantamento (30/03 e 31/03)
- [ ] Trifold compila base de conhecimento (FAQ, empreendimentos)
- [ ] Trifold envia prints das etapas do funil do Supremo
- [ ] Trifold envia plantas dos empreendimentos
- [ ] Gabriel cria repositorio GitHub (org freelans-dev)
- [ ] Setup Supabase (conta nova)
- [ ] Setup Vercel (auto-deploy)
- [ ] Setup Telegram bot (@NicoleTrifoldBot)
- [ ] Adaptar base do agente-linda para estrutura Trifold
- [ ] Apresentar prototipo na sexta 04/04 as 14h-15h

### Fase 1 -- MVP Conversacional (04/04 -> 2-4 semanas)
- Agente Nicole no Telegram respondendo leads
- Base de conhecimento com Vind e Yarden carregada
- Qualificacao de leads (com regra de entrada para Yarden)
- Handoff transparente para corretor
- Guardrails ativos (memorial, simulacao, materiais)
- Pipeline kanban basico
- Painel admin para treinamento da IA
- Registro completo de conversas
- **Meta:** Rodando e validado antes de migrar para WhatsApp

### Fase 2 -- CRM + Tracking (pos-MVP, ~1-2 meses)
- Migracao Telegram -> WhatsApp/Z-API (numero oficial Trifold)
- Painel do corretor completo
- Supervisao em tempo real com intervencao
- Integracao Meta Ads (rastreamento de origem)
- Dashboard de metricas (conversao, performance)
- Follow-up pos-visita automatizado
- Monitoramento de conversas dos corretores (Z-API multi-instancia)
- Designacao inteligente de leads a corretores

### Fase 3 -- Evolucao continua (pos-Fase 2)
- Nutricao automatizada de leads frios (1.000+ da base)
- Coaching de corretores via IA
- Geracao de criativos integrada (Reche Studio)
- Analise de dados de trafego com agente IA
- Expansao para novos empreendimentos

### Deadlines criticos

| Marco | Data | Importancia |
|-------|------|------------|
| Prototipo funcional | 04/04/2026 | Demonstrar diferencial vs 4 tentativas anteriores |
| MVP Telegram validado | Abril/2026 | Provar que funciona antes de migrar pra WhatsApp |
| MVP WhatsApp rodando | Maio-Junho/2026 | Pronto para receber leads reais |
| **Lancamento Yarden** | **Julho/2026** | **DEADLINE INEGOCIAVEL** -- agente precisa estar rodando |

---

## 12. Riscos e Mitigacoes

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|--------------|---------|-----------|
| R1 | **4 fracassos anteriores = ceticismo alto** | ALTA | CRITICO | Prototipo funcional na sexta 04/04; resultados rapidos; diferencial claro vs bots genericos |
| R2 | **Equipe Trifold com tempo limitado (4-5h/semana)** | ALTA | ALTO | Gabriel leva base pronta (70% reuso); reunioes presenciais focadas; equipe refina, nao constroi do zero |
| R3 | **Deadline Yarden julho/2026 apertado** | MEDIA | CRITICO | Comecar com Telegram (setup rapido); MVP conversacional primeiro; CRM completo vem depois |
| R4 | **Dependencia do agente-linda (technical debt)** | MEDIA | MEDIO | Monorepo limpo; schema novo; adaptar, nao copiar code debt |
| R5 | **Z-API multi-instancia (corretores)** | MEDIA | MEDIO | Validar viabilidade tecnica antes de prometer; comecar monitorando 1 numero |
| R6 | **IA alucinando informacoes sensiveis** | BAIXA | CRITICO | Guardrails rigorosos; base de conhecimento curada; Gabriel filtra memorial descritivo; testes de stress |
| R7 | **Corretores nao adotarem o sistema** | MEDIA | ALTO | Painel simplificado; treinamento presencial; demonstrar valor (resumo IA, contexto do lead) |
| R8 | **Base de conhecimento incompleta** | ALTA | ALTO | Comecar com FAQ basico (ja temos o CSV); iterar conforme equipe alimenta; priorizar Yarden |
| R9 | **Alexandre viaja 2 semanas** | CONFIRMADO | MEDIO | Lucas/Marcao sao os operadores reais; decisoes de valor ficaram pra 04/04 antes da viagem |
| R10 | **Custo de infraestrutura maior que o esperado** | BAIXA | MEDIO | Começar com tiers gratuitos/basicos; escalar conforme volume |

---

## 13. Metricas de Sucesso

### Metricas primarias (MVP)

| Metrica | Como medir | Meta inicial |
|---------|-----------|-------------|
| **Taxa de resposta** | Leads que recebem resposta em < 1 minuto / total de leads | > 95% |
| **Taxa de qualificacao** | Leads qualificados pelo agente / total de leads atendidos | > 30% |
| **Taxa de agendamento** | Visitas agendadas / leads qualificados | > 40% |
| **Taxa de comparecimento** | Leads que visitaram o stand / leads que agendaram | > 60% |
| **Naturalidade do agente** | % de leads que percebem que e bot (medido por feedback) | < 10% |

### Metricas secundarias (Fase 2-3)

| Metrica | Como medir | Meta |
|---------|-----------|------|
| **Conversao por campanha** | Fechamentos / leads por campanha Meta Ads | Baseline a definir |
| **Custo por lead qualificado** | Investimento Meta Ads / leads qualificados | Reduzir vs atual |
| **Performance por corretor** | Taxa de fechamento individual | Baseline a definir |
| **Tempo medio de ciclo** | Dias entre primeiro contato e fechamento | Baseline a definir |
| **Satisfacao do corretor** | NPS interno (survey trimestral) | > 7/10 |
| **Leads reativados** | Leads frios que retomaram contato apos nutricao | > 5% da base |
| **ROI do sistema** | Receita incremental atribuida ao agente / custo total | > 5x |

### KPIs de comparacao (vs solucoes anteriores)

| Comparacao | Lais (referencia positiva) | Zenvia (referencia negativa) | Nicole (meta) |
|-----------|--------------------------|-----------------------------|----|
| Custo mensal | R$1.400 | R$1.000+ | A definir |
| Qualidade de atendimento | Boa ("espetaculo") | Ruim ("obvio que e bot") | Superior a Lais |
| Qualificacao de leads | Basica | Nao fazia | Avancada (com regras de negocio) |
| Envio de materiais | N/A | Nao conseguia | Sim (plantas, renders) |
| CRM integrado | Sim (proprio) | Nao | Sim (proprio, mais avancado) |
| Transbordo | Desestruturado | N/A | Transparente + resumo IA |

---

## Apendice A: Glossario do Mercado Imobiliario

| Termo | Significado |
|-------|------------|
| Stand de vendas | Espaco fisico com decorado onde leads visitam e fecham negocio |
| Decorado | Apartamento modelo montado para visita |
| Memorial descritivo | Documento tecnico com especificacoes de materiais e acabamentos -- NAO pode ser prometido pela IA |
| Corretor interno | Comissao de 2%, equipe propria da Trifold |
| Corretor externo | Comissao de 4,5%, imobiliarias parceiras |
| SDR | Sales Development Rep -- funcao que a Nicole vai exercer (pre-qualificacao) |
| Transbordo/Handoff | Momento em que a conversa passa do agente IA para o corretor humano |
| Vind | Empreendimento em comercializacao (48 un, 67m2, entrega 2027) |
| Yarden | Empreendimento em lancamento (60 un, 79-84m2, entrega 2029, lanca jul/2026) |
| Tipologia | Configuracao do apartamento (2 suites, 3 dorm, etc.) |
| MCMV | Minha Casa Minha Vida -- programa habitacional (pergunta frequente dos leads) |

## Apendice B: Base de Conhecimento Inicial (do CSV)

A base de conhecimento NLU ja contem 22 pares de pergunta-resposta cobrindo:
- Interesse geral / escolha de empreendimento
- Localizacao (Vind e Yarden)
- Metragem e tipologias
- Data de entrega
- Solicitacao de planta (redireciona para visita)
- Promocoes/descontos (redireciona para visita)
- Valores (redireciona para visita)
- Fotos (envia + convida para visita)
- Entrada e parcelas (redireciona para visita)
- MCMV (pergunta valor de entrada)
- Sem entrada (informa que e necessaria)
- Decorado (agenda visita)
- Endereco da Trifold
- Dados complementares: andares, unidades por andar, total de unidades, areas de lazer

> **Nota:** Todas as respostas seguem a estrategia de despertar interesse e redirecionar para visita presencial. Essa e a base que alimentara o RAG inicial da Nicole.

---

**Proximo passo:** Este Project Brief vai para o @pm (Morgan) que criara o PRD completo com epics, seguindo o pipeline AIOS: `@pm -> @po -> @sm -> @dev -> @qa -> @devops`.
