# Requisitos do Projeto — CRM + Agente IA Trifold

**Agente:** @dx-interviewer (Lyra) — DX Squad / Reche Inc.
**Base:** Reunioes presenciais 30/03 e 31/03/2026
**Versao:** 1.0 (pre-proposta)

---

## 1. Visao do Projeto

**Nome:** CRM Trifold (subdominio planejado: crm.3fold)

**O que e:** Plataforma de CRM com agente de IA conversacional via WhatsApp, desenvolvida especificamente para o mercado imobiliario. O sistema qualifica leads automaticamente, responde duvidas sobre empreendimentos, agenda visitas ao stand de vendas, e fornece um pipeline completo de gestao de leads com supervisao em tempo real das conversas entre corretores e clientes.

**Para quem:** Equipe comercial da Trifold Engenharia (construtora de Maringa-PR) — supervisores, corretores internos, e gestao.

**Problema que resolve:** A Trifold tem um gargalo critico no atendimento de leads. Com lancamento de 200 unidades (Yarden) previsto para julho/2026, base de 1.000+ leads parados, e 4+ tentativas fracassadas de chatbot, a empresa precisa de uma solucao que entenda as peculiaridades do mercado imobiliario: ciclo de venda longo, fechamento presencial obrigatorio, e necessidade de qualificacao antes do transbordo ao corretor.

---

## 2. Modulos do Sistema

### 2.1 Agente Conversacional WhatsApp

**Descricao:** Agente de IA conversacional que atende leads no numero oficial da Trifold via WhatsApp. Qualifica leads, responde FAQ dos empreendimentos, agenda visitas ao stand, e faz transbordo transparente para o corretor quando necessario.

**Features principais:**
- Atendimento automatico no numero oficial da Trifold
- Personalidade simpatica e "boa praca" (nao roboticar)
- Resposta a perguntas frequentes (localizacao, conceito, diferenciais, prazo de entrega)
- Qualificacao de leads (tem entrada? interesse real? perfil compativel?)
- Envio de plantas e materiais visuais do empreendimento
- Agendamento de visitas ao stand de vendas
- Transbordo transparente para corretor (cliente nao percebe a troca)
- Guardrails: nao prometer materiais especificos, nao fazer simulacao financeira detalhada, nao expor memorial descritivo tecnico
- Estrategia de "informar o suficiente para despertar interesse, sem saciar curiosidade"

**Prioridade:** MVP — Modulo #1

---

### 2.2 CRM / Pipeline de Leads

**Descricao:** Pipeline visual (kanban) de gestao de leads com etapas do funil customizaveis, designacao a corretores, e historico completo de interacoes.

**Features principais:**
- Pipeline visual (kanban) com etapas do funil da Trifold
- Cadastro de leads com dados capturados pelo agente e pelo corretor
- Designacao de leads ao corretor mais adequado (por empreendimento/especialidade)
- Historico completo de conversa (agente + corretor + supervisor)
- Status do lead (novo, qualificado, agendado, visitou, negociando, fechou, perdido)
- Movimentacao manual entre etapas
- Reativacao de leads frios (base de 1.000+)
- Notas do corretor pos-visita (texto ou audio transcrito por IA)

**Prioridade:** MVP — Modulo #2

---

### 2.3 Painel Administrativo

**Descricao:** Interface para supervisores e gestores configurarem a IA, gerenciarem empreendimentos, monitorarem conversas e controlarem o sistema.

**Features principais:**
- Cadastro e edicao de empreendimentos (info, unidades, diferenciais, FAQ)
- Treinamento da IA (base de conhecimento, perguntas e respostas, restricoes)
- Monitoramento de conversas em tempo real (agente e corretor)
- Intervencao direta: supervisor pode entrar na conversa ou enviar instrucoes ao corretor via IA
- Gestao de corretores (cadastro, numero Trifold vinculado, empreendimentos atribuidos)
- Configuracao de handoff (tempo de espera, regras de transbordo)
- Configuracao de horario comercial e mensagens fora do horario

**Prioridade:** MVP — Modulo #3

---

### 2.4 Painel do Corretor

**Descricao:** Interface simplificada para o corretor ver seus leads, acompanhar conversas, registrar feedback de visitas e receber instrucoes.

**Features principais:**
- Lista de leads designados ao corretor
- Historico de conversa do agente com cada lead (contexto antes do transbordo)
- Resumo IA do lead (o que o agente ja descobriu: preferencias, perguntas, perfil)
- Registro de feedback pos-visita (texto ou audio → transcricao IA)
- Notificacoes de novos leads designados
- Instrucoes do supervisor via IA (quando supervisor intervem)
- Link direto para abrir lead no sistema apos visita

**Prioridade:** Fase 2 (pode comecar como versao simplificada no MVP)

---

### 2.5 Integracao Meta Ads (Tracking)

**Descricao:** Rastreamento completo de origem dos leads — de qual anuncio, campanha e criativo cada lead veio.

**Features principais:**
- Captura de UTM parameters dos anuncios
- Vinculacao lead ↔ campanha ↔ criativo
- Identificacao de quais campanhas geram leads qualificados (nao apenas leads)
- Identificacao de quais campanhas geram visitas e fechamentos
- Custo por lead qualificado por campanha

**Prioridade:** Fase 2 — Alexandre classificou como "muito importante" e "essencial"

---

### 2.6 Dashboard Analytics

**Descricao:** Metricas de conversao, performance de corretores, ROI de campanhas, e visao completa da jornada do cliente.

**Features principais:**
- Leads por periodo (dia, semana, mes)
- Taxa de qualificacao (leads qualificados / total)
- Taxa de agendamento (visitas agendadas / leads qualificados)
- Taxa de comparecimento (visitou / agendou)
- Taxa de fechamento (fechou / visitou)
- Performance por corretor
- Performance por campanha/criativo (pos-integracao Meta Ads)
- Jornada completa do lead (desde anuncio ate fechamento ou perda)
- Motivos de perda mapeados

**Prioridade:** Fase 2-3

---

## 3. Dados dos Empreendimentos (Estrutura Cadastravel)

### 3.1 Informacoes Gerais
- Nome do empreendimento (ex: Vinci, Yarden)
- Localizacao (endereco, bairro, cidade)
- Conceito / proposta de valor
- Fotos e renders
- Status (em obras, lancamento, pronto)
- Prazo de entrega estimado

### 3.2 Unidades
- Numero/identificacao da unidade
- Andar
- Tipologia (ex: 2 quartos, 3 quartos)
- Metragem (area privativa, area total)
- Posicao (vista para rua, vista interna, orientacao solar)
- Numero de garagens
- Status: disponivel / reservado / vendido
- Observacoes (andar alto, andar baixo, diferenciais da unidade)

### 3.3 Plantas / Tipologias
- Arquivo de planta por tipologia (PDF/imagem)
- Descricao da tipologia
- Metragem
- Numero de quartos/banheiros/vagas

### 3.4 Diferenciais
- Diferenciais gerais do empreendimento
- Areas comuns
- Infraestrutura do bairro/regiao
- **NAO incluir:** materiais especificos de acabamento (risco juridico — memorial descritivo pode mudar)

### 3.5 FAQ Especifico
- Perguntas frequentes sobre o empreendimento
- Respostas aprovadas pela equipe
- Restricoes (o que NAO pode ser dito)
- Formas de pagamento padrao (entrada + parcelas — sem simulacao especifica)

### 3.6 Regras Comerciais por Empreendimento
- Exige entrada? (Yarden: sim, obrigatoria)
- Faixa de preco geral (se pode informar)
- Programa habitacional? (Minha Casa Minha Vida, etc.)
- Restricoes de qualificacao

---

## 4. Fluxo do Agente IA

### 4.1 Como o lead chega
1. **Meta Ads** (Facebook/Instagram) → clica no anuncio → WhatsApp oficial
2. **Site** → botao de WhatsApp → numero oficial
3. **Indicacao** → lead entra em contato direto pelo WhatsApp
4. **Reativacao** → agente entra em contato com leads da base fria (futuro)

### 4.2 O que o agente faz
1. **Recepciona** com simpatia e personalidade ("boa praca")
2. **Identifica interesse** — qual empreendimento? (Vinci, Yarden, ou nao sabe)
3. **Responde FAQ** — localizacao, conceito, diferenciais, prazo de entrega
4. **Envia materiais** — plantas, renders (quando solicitado)
5. **Qualifica** — tem entrada? perfil compativel? interesse real?
6. **Agenda visita** — propoe horario para ir ao stand de vendas
7. **Coleta dados** — nome, telefone, email, preferencias (andar, vista, garagens)
8. **Aplica gatilhos de interesse** — convites para visita com diferencial (ex: "venha tomar um cafe", experiencia no decorado)

### 4.3 Quando escala pro corretor (handoff)
- Lead qualificado que quer conversar sobre valores detalhados
- Lead quer fazer simulacao financeira
- Lead agendou visita e precisa de acompanhamento
- Lead faz pergunta que foge do escopo da IA
- Supervisao identifica necessidade de intervencao humana
- **Regra:** transbordo e transparente — cliente nao sabe que mudou de atendente

### 4.4 Informacoes que coleta do lead
- Nome completo
- Telefone (ja tem pelo WhatsApp)
- Empreendimento de interesse
- Numero de quartos desejado
- Preferencia de andar (alto/baixo)
- Preferencia de vista (rua/interna)
- Numero de garagens
- Tem entrada disponivel? (qualificacao obrigatoria para Yarden)
- Como conheceu a Trifold (origem)
- Disponibilidade para visita

### 4.5 Como designa o lead ao corretor
- **Por empreendimento:** cada corretor e especialista em um ou mais empreendimentos
- **Numero Trifold:** corretor recebe numero da empresa (nao usa pessoal)
- **Contexto completo:** corretor recebe resumo IA de tudo que o agente ja conversou
- **Notificacao:** corretor e notificado de novo lead designado
- **[Futuro] Round-robin ou performance:** designacao automatica por disponibilidade ou taxa de conversao

---

## 5. Integracoes Necessarias

### 5.1 WhatsApp (Z-API)
- **Status:** Gabriel ja usa no agente-linda
- **Uso:** Numero oficial Trifold + numeros dos corretores (monitoramento)
- **Funcionalidades:** Envio/recebimento de mensagens, envio de arquivos (plantas), webhooks
- **Prioridade:** MVP

### 5.2 Meta Ads
- **Status:** Trifold ja investe em trafego pago
- **Uso:** Rastreamento de origem do lead (campanha, conjunto, criativo)
- **Funcionalidades:** Captura de UTM, API de conversoes (para otimizar campanhas)
- **Prioridade:** Fase 2

### 5.3 CRM Supremo
- **Status:** Em uso pela equipe comercial
- **Decisao:** NAO integrar no MVP — CRM proprio substitui
- **Futuro:** Possivel importacao de dados historicos
- **Observacao:** Tentativa anterior (Lais) falhou justamente na integracao com Supremo

### 5.4 Calendario (Agendamento de Visitas)
- **Status:** Nao definido qual ferramenta
- **Uso:** Agente agenda visita, corretor ve agenda, evita conflitos
- **Opcoes:** Google Calendar (agente-linda ja tem integracao), Cal.com, ou calendario interno
- **Prioridade:** MVP (basico) → evolui na Fase 2

### 5.5 Monitoramento de Conversas do Corretor
- **Status:** Gabriel propos usar Z-API para monitorar numeros Trifold dos corretores
- **Uso:** Webhook escutando conversas → salva no sistema → supervisao + IA analisa
- **Prioridade:** MVP (se viavel tecnicamente com Z-API multi-instancia)

---

## 6. Modelo Comercial

### Acordado ate o momento:
- **Tipo:** Consultoria + desenvolvimento conjunto
- **Gabriel entrega:** Base do agente-linda adaptada + Claude Code + agentes + direcionamento presencial
- **Trifold entrega:** Dedicacao de 4-5h/semana (Lucas/Marcao) + base de conhecimento + feedback
- **Propriedade:** Sistema fica com a Trifold (constroem em cima da base)

### Pendente para definicao (04/04):
- Valor unico da base (licenca do agente-linda adaptado)
- Valor hora de consultoria do Gabriel
- Possibilidade de comissao sobre vendas ou equity (Gabriel mencionou interesse)
- Mensalidade recorrente (se houver — para manutencao, suporte, evolucoes)
- Custos de infraestrutura (Z-API, servidor, tokens IA) — quem paga

### Referencia de mercado:
- Trifold pagava R$1.400/mes na Lais e estava satisfeita
- Trifold paga ~R$1.000+/mes na Zenvia e esta insatisfeita
- Gabriel paga R$1.100/mes no Claude Code Max

---

## 7. Timeline / Fases

### Fase 0 — Preparacao (31/03 → 04/04)
- Trifold compila base de conhecimento
- Gabriel adapta agente-linda para Trifold
- Gabriel prepara proposta comercial

### Fase 1 — MVP Conversacional (04/04 → ~2-4 semanas)
- Agente WhatsApp no numero oficial
- Qualificacao de leads + FAQ
- Handoff para corretor
- Painel administrativo basico (treinamento IA, base de conhecimento)
- Pipeline de leads basico (kanban)
- **Meta:** Estar rodando antes do lancamento do Yarden (julho/2026)

### Fase 2 — Tracking + Analytics (~1-2 meses apos MVP)
- Integracao Meta Ads (rastreamento de origem)
- Dashboard de metricas (conversao, performance)
- Painel do corretor completo
- Follow-up pos-visita automatizado
- Monitoramento de conversas dos corretores

### Fase 3 — Evolucoes (~continuo)
- Nutricao automatizada de leads frios
- Coaching de corretores via IA (analise de conversas)
- Geracao de criativos integrada (Reche Studio)
- Analise de dados de trafego com agente IA
- Expansao para outros empreendimentos/lancamentos

### Restricao de timeline:
- **Lancamento Yarden (200 unidades): julho/2026** — MVP precisa estar rodando antes

---

## 8. O que ja Existe no agente-linda que Pode ser Reusado

### JA PRONTO (reuso direto ou com adaptacao minima)

| Feature agente-linda | Modulo Trifold | Adaptacao necessaria |
|---------------------|---------------|---------------------|
| **Agent engine completo** (`agent-engine.ts`, `core.ts`, `claude-client.ts`) | Agente Conversacional | Adaptar prompts e fluxo para imobiliario |
| **Prompt builder + loader** (`prompt-builder.ts`, `prompt-loader.ts`) | Agente Conversacional | Criar prompts especificos para Trifold |
| **Guardrails** (`guardrails.ts`) | Agente Conversacional | Configurar restricoes do mercado imobiliario |
| **Sales flow** (`sales-flow.ts`) | Agente Conversacional | Adaptar funil de vendas para jornada imobiliaria |
| **Handoff / consultant router** (`consultant-router.ts`) | Handoff para corretor | Adaptar logica de designacao para corretores |
| **Data extractor** (`data-extractor.ts`) | Qualificacao de leads | Adaptar campos extraidos para perfil imobiliario |
| **Confidence scorer** (`confidence-scorer.ts`) | Qualificacao de leads | Calibrar thresholds para mercado imobiliario |
| **History summarizer** (`history-summarizer.ts`) | Resumo para corretor | Reuso direto |
| **Knowledge base / RAG** (`rag/`) | Base de conhecimento | Alimentar com dados dos empreendimentos |
| **Training interface** (`dashboard/training/`) | Painel administrativo | Reuso direto |
| **Dashboard** (`dashboard/`) | Painel administrativo | Adaptar layout e metricas |
| **Pipeline / Kanban** (`dashboard/pipeline/`, `dashboard/kanban/`) | CRM Pipeline | Adaptar etapas para funil imobiliario |
| **Leads management** (`dashboard/leads/`) | CRM Leads | Adaptar campos para mercado imobiliario |
| **Business hours** (`agent/business-hours.ts`) | Config horario | Reuso direto |
| **Notification service** (`agent/notification-service.ts`) | Notificacoes | Reuso direto |
| **Model selector** (`agent/model-selector.ts`) | Selecao de modelo IA | Reuso direto |
| **Analytics dashboard** (`dashboard/analytics/`) | Dashboard Analytics | Adaptar metricas |
| **Bookings / agendamento** (`dashboard/bookings/`, `agent/calcom-client.ts`, `agent/google-calendar-client.ts`) | Agendamento de visitas | Adaptar para visitas ao stand |
| **Handoffs management** (`dashboard/handoffs/`) | Supervisao de transbordo | Reuso direto |
| **Z-API integration** (mencionado no projeto) | WhatsApp | Reuso direto |
| **Broadcasts** (`dashboard/broadcasts/`) | Nutricao de leads | Reuso direto (Fase 3) |
| **Catalog** (`dashboard/catalog/`) | Empreendimentos | Adaptar para imoveis em vez de produtos |
| **Settings** (`dashboard/settings/`) | Config sistema | Reuso direto |
| **Supabase DB** (`supabase/`) | Banco de dados | Adaptar schema para entidades imobiliarias |
| **Monorepo structure** (turbo + packages) | Arquitetura | Reuso direto |

### PRECISA SER CONSTRUIDO

| Feature | Motivo |
|---------|--------|
| **Base de conhecimento imobiliaria** (empreendimentos, unidades, plantas) | Modelo de dados especifico do mercado |
| **Logica de qualificacao imobiliaria** (entrada, perfil, programa habitacional) | Regras de negocio especificas da Trifold |
| **Tracking de origem (Meta Ads)** | Nao existe no agente-linda |
| **Monitoramento de conversas do corretor** (Z-API multi-instancia) | Funcionalidade nova — escutar numeros dos corretores |
| **Supervisao em tempo real com intervencao** | Nivel de supervisao mais avancado que o handoff atual |
| **Follow-up pos-visita** (corretor registra feedback, audio → transcricao) | Fluxo novo especifico do presencial |
| **Painel do corretor simplificado** | Visao diferente do dashboard admin |
| **Regras de restricao de conteudo** (memorial descritivo, materiais, simulacao) | Guardrails especificos do mercado imobiliario |
| **Designacao inteligente de leads a corretores** (por empreendimento/especialidade) | Logica nova de roteamento |

### Estimativa de reuso:
- **~70% da base do agente-linda pode ser reusada** com adaptacoes
- **~30% precisa ser construido** (logica de negocio imobiliaria, tracking, supervisao avancada)
- A arquitetura (monorepo, Supabase, Next.js, Z-API) e 100% reusavel

---

## Apendice: Glossario do Mercado Imobiliario (Trifold)

| Termo | Significado |
|-------|------------|
| Stand de vendas | Espaco fisico com decorado onde leads visitam e fecham negocio |
| Decorado | Apartamento modelo montado para visita |
| Memorial descritivo | Documento tecnico com especificacoes de materiais e acabamentos — NAO pode ser prometido |
| Corretor interno | Comissao de 2%, equipe propria da Trifold |
| Corretor externo | Comissao de 4,5%, imobiliarias parceiras |
| SDR | Sales Development Rep — funcao que o agente IA vai exercer (pre-qualificacao) |
| Transbordo | Momento em que a conversa passa do agente IA para o corretor humano |
| Vinci | Empreendimento em comercializacao |
| Yarden | Empreendimento em lancamento (200 unidades, julho/2026) |
