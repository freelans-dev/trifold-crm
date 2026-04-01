# PO Validation — Trifold CRM PRD v1.1

**Validador:** @po (Pax) — AIOS Pipeline
**Data:** 31/03/2026
**PRD avaliado:** trifold-crm-prd.md v1.1 (Morgan)
**Documentos base:** Project Brief v1.0, Catalogo de Unidades Requisitos, WhatsApp Custos Detalhados, WhatsApp Meta Integration Research

---

## Status: APPROVED (com ajustes obrigatorios)

O PRD esta solido, bem estruturado, e alinhado com as reunioes e o brief. A decisao de arquitetura WhatsApp Cloud API + Coexistence Mode (Opcao C da pesquisa) esta correta e elimina os riscos criticos de Z-API. Porem, ha **inconsistencias internas no PRD** e **gaps de priorizacao** que precisam ser resolvidos antes do @sm criar stories. Os ajustes sao listados abaixo e **nao bloqueiam o inicio do desenvolvimento** — podem ser corrigidos em paralelo.

---

## Validacao por Epic

### Epic 1 — Setup e Infraestrutura: OK

Escopo correto. Todas as features sao P0 e sao pre-requisito para tudo. Sem ajustes.

**Observacao:** E1-F4 (WhatsApp Cloud API setup) depende da Trifold dar acesso ao Meta Business Manager. Esse acesso precisa ser solicitado **hoje** (31/03) para nao bloquear o desenvolvimento.

---

### Epic 2 — Catalogo de Empreendimentos e Unidades: OK

Escopo completo e alinhado com o documento de requisitos do catalogo. A estrutura Empreendimento > Tipologia > Unidade esta correta.

**Observacao:** E2-F5 (Seed Vind) e E2-F6 (Seed Yarden) dependem de dados reais da Trifold (mapa de unidades, status vendido/reservado, posicao/vista por unidade). Se os dados reais nao chegarem ate quarta 02/04, usar seed generico (todas as unidades disponiveis, posicoes estimadas) e ajustar na semana de validacao.

---

### Epic 3 — Agente Nicole: AJUSTE NECESSARIO

**Inconsistencia critica no PRD:** O fluxo principal (secao 4.2) descreve "Telegram Webhook" e "Telegram Bot API", mas a arquitetura decidida e WhatsApp Cloud API + Coexistence Mode. O PRD oscila entre Telegram e WhatsApp em varios pontos:

- Secao 4.2 diz "Telegram adapter" mas E3-F10 diz "WhatsApp Cloud API adapter"
- Timeline Sprint 1 (linhas 668-671) fala de "Telegram bot recebendo mensagens" e "Nicole respondendo no Telegram"
- Entregas P0 (linha 674) falam "Nicole conversando no Telegram"
- Sprint 3 (linha 701) fala de "Migracao Telegram -> WhatsApp"

**Decisao do PO:** A arquitetura e Cloud API + Coexistence Mode. Porem, para o prototipo de sexta 04/04:

- **Se o acesso ao Meta Business da Trifold estiver pronto ate terca 01/04:** ir direto com Cloud API. Sem Telegram.
- **Se o acesso ao Meta Business NAO estiver pronto:** usar Telegram como fallback para demo na sexta. Migrar para Cloud API na semana de validacao. O E3-F14 (Telegram bot fallback) sobe de P2 para P0 condicional nesse caso.

**Outra observacao:** E3-F10 menciona "Z-API/WhatsApp" na descricao do Epic 7, mas o Epic 3 ja define o Cloud API adapter. Nao deve haver referencia a Z-API no MVP. Z-API foi descartada pela pesquisa de integracao (risco de banimento).

---

### Epic 4 — CRM e Pipeline: OK

Escopo correto. Prioridades P0/P1/P2 fazem sentido. E4-F10 (interesse em unidade especifica) como P1 esta bom — pode entrar na semana de validacao.

---

### Epic 5 — Painel Administrativo: OK (com ajuste de prioridade)

**Ajuste:** E5-F8 (Intervencao em conversa) esta como P1, mas o brief classifica supervisao em tempo real como CORE. Para sexta, o minimo e: supervisor VE as conversas (E5-F5 esta P0, correto). Intervencao ativa (enviar mensagem como supervisor) pode ficar P1. OK como esta.

---

### Epic 6 — Painel do Corretor: OK

Escopo correto para MVP. E6-F6 (feedback pos-visita) como P1 esta correto — nao e critico para sexta, mas sera importante na semana de validacao.

**Observacao sobre Coexistence Mode:** O PRD nao deixa explicito como o corretor interage no dia a dia. Com Coexistence Mode, o corretor pode responder pelo WhatsApp Business App no celular. O painel do corretor no CRM e para visualizar pipeline, leads, resumo IA, historico. A resposta ao lead acontece no WhatsApp Business App. Isso precisa estar claro nas stories.

---

### Epic 7 — Integracoes: AJUSTE NECESSARIO

**Inconsistencia:** O titulo do Epic diz "Z-API/WhatsApp" mas a decisao de arquitetura e Cloud API. Ajustar titulo para "Integracoes (Meta/WhatsApp Cloud API)".

**Sobre E7-F3 (Cloud API Coexistence Mode):** Esta descricao esta correta e alinhada com a pesquisa. E o diferencial do sistema. Prioridade P0 correta.

**Sobre E7-F1 (Meta Ads webhook):** P0 esta correto. Meta Ads e a fonte principal de leads da Trifold. O webhook receiver de formularios do Facebook/Instagram precisa estar pronto na sexta.

**Sobre E7-F4 (Click-to-WhatsApp Ads):** P1 esta correto. CTWA Ads so faz sentido quando o Cloud API estiver rodando em producao. Para a demo de sexta, Meta Ads webhook (formularios) e suficiente.

---

### Epic 8 — Analytics e Relatorios: OK

Tudo P1/P2. Nenhuma feature de analytics e P0 para sexta. Correto. Dashboard principal (E5-F1) ja cobre metricas basicas.

---

## Backlog Priorizado (Sprint 0-1: ate sexta 04/04)

### Bloco 1: Fundacao (seg 31/03 - ter 01/04)
Sem isso nada funciona.

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 1 | E1-F1: Repositorio GitHub | E1 | Pre-requisito absoluto |
| 2 | E1-F2: Supabase novo | E1 | Schema e base de tudo |
| 3 | E1-F3: Vercel deploy | E1 | CI/CD desde o dia 1 |
| 4 | E1-F5: Environment variables | E1 | Config de APIs |
| 5 | E1-F6: Auth e roles | E1 | Admin, supervisor, broker |
| 6 | E1-F7: Seed de dados iniciais | E1 | Organizacao, usuario, pipeline stages |

### Bloco 2: Core de Dados (ter 01/04 - qua 02/04)
Alimenta a Nicole e o CRM.

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 7 | E2-F1: CRUD empreendimentos | E2 | Core do negocio |
| 8 | E2-F2: CRUD tipologias | E2 | Vinculado ao empreendimento |
| 9 | E2-F3: CRUD unidades individuais | E2 | 108 unidades (48 Vind + 60 Yarden) |
| 10 | E2-F4: Filtros de unidades | E2 | Admin e corretor precisam filtrar |
| 11 | E2-F5: Seed Vind (48 un) | E2 | Dados reais ou estimados |
| 12 | E2-F6: Seed Yarden (60 un) | E2 | Dados reais ou estimados |

### Bloco 3: Nicole Conversacional (ter 01/04 - qui 03/04)
O corecao do produto. Paralelo com Bloco 2.

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 13 | E1-F4: WhatsApp Cloud API setup (OU Telegram fallback) | E1 | Canal de comunicacao |
| 14 | E3-F1: Personalidade Nicole | E3 | Define o tom |
| 15 | E3-F2: Base de conhecimento RAG | E3 | Alimenta respostas |
| 16 | E3-F3: Identificacao de empreendimento | E3 | Vind vs Yarden |
| 17 | E3-F4: Qualificacao de leads | E3 | Core da qualificacao |
| 18 | E3-F5: Regra de entrada Yarden | E3 | Regra de negocio critica |
| 19 | E3-F6: Guardrails da IA | E3 | Seguranca — memorial, preco, simulacao |
| 20 | E3-F10: WhatsApp Cloud API adapter (OU Telegram adapter) | E3 | Receber/enviar mensagens |
| 21 | E3-F11: Horario comercial | E3 | Operacional basico |
| 22 | E3-F12: Estado da conversa | E3 | Persistencia de contexto |
| 23 | E3-F9: Handoff transparente | E3 | Transbordo ao corretor |

### Bloco 4: CRM e Pipeline (qua 02/04 - qui 03/04)

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 24 | E4-F1: Pipeline kanban | E4 | Visual core do CRM |
| 25 | E4-F2: Etapas configuraveis | E4 | Seed com etapas default |
| 26 | E4-F3: Filtros do pipeline | E4 | Empreendimento, corretor, status |
| 27 | E4-F4: Lead management | E4 | CRUD de leads |
| 28 | E4-F5: Detalhe do lead | E4 | Pagina completa |
| 29 | E4-F6: Designacao de leads a corretores | E4 | Roteamento basico |
| 30 | E4-F7: Conversa do agente visivel | E4 | Historico completo |
| 31 | E4-F8: Resumo IA da conversa | E4 | Diferencial vs concorrentes |
| 32 | E4-F9: Activity logs | E4 | Timeline de atividades |

### Bloco 5: Paineis (qui 03/04 - sex 04/04)

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 33 | E5-F1: Dashboard principal | E5 | Metricas basicas |
| 34 | E5-F2: Treinamento da IA | E5 | Admin edita base de conhecimento |
| 35 | E5-F3: Config personalidade | E5 | Admin ajusta prompts |
| 36 | E5-F4: Gestao de corretores | E5 | CRUD corretores |
| 37 | E5-F5: Monitoramento de conversas | E5 | Supervisao real-time |
| 38 | E5-F6: Config de pipeline | E5 | Gerenciar etapas |
| 39 | E5-F7: Gestao de empreendimentos | E5 | Interface CRUD catalogo |
| 40 | E5-F10: Config horario comercial | E5 | Operacional |
| 41 | E6-F1: Login corretor | E6 | Auth com role broker |
| 42 | E6-F2: Pipeline proprio | E6 | Kanban filtrado |
| 43 | E6-F3: Lista de leads | E6 | Leads do corretor |
| 44 | E6-F4: Detalhe do lead (corretor) | E6 | Dados + conversa |
| 45 | E6-F5: Resumo IA do lead | E6 | "O que precisa saber" |
| 46 | E6-F8: Conversa do agente | E6 | Visualizar historico |

### Bloco 6: Integracoes Essenciais (qui 03/04 - sex 04/04)

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 47 | E7-F1: Meta Ads webhook | E7 | Fonte principal de leads |
| 48 | E7-F2: Tracking de origem | E7 | UTM params |
| 49 | E7-F3: Cloud API Coexistence Mode | E7 | Handoff ao corretor no WhatsApp |

### Bloco 7: Nicole — Materiais e Agendamento (paralelo)

| # | Feature | Epic | Justificativa |
|---|---------|------|---------------|
| 50 | E3-F7: Envio de materiais | E3 | Plantas, renders |
| 51 | E3-F8: Agendamento de visitas | E3 | Convite ao stand |

**Total P0: 51 features**

---

## Features P1 (Semana de Validacao 04/04 - 11/04)

| Feature | Epic | Justificativa |
|---------|------|---------------|
| E2-F7: Upload de materiais | E2 | Admin sobe plantas/fotos |
| E2-F8: Galeria de empreendimento | E2 | Visualizacao no painel |
| E3-F13: Model selector (Sonnet/Haiku) | E3 | Otimizacao de custo |
| E4-F10: Interesse em unidade especifica | E4 | Vincular lead a unidade |
| E5-F8: Intervencao em conversa | E5 | Supervisor envia msg |
| E5-F9: Config handoff | E5 | Regras de transbordo |
| E6-F6: Feedback pos-visita | E6 | Registro de resultado |
| E6-F7: Notificacoes | E6 | Push + in-app |
| E7-F4: Click-to-WhatsApp Ads | E7 | CTWA referral data |
| E8-F1: Leads por periodo | E8 | Grafico basico |
| E8-F2: Funil de conversao | E8 | Taxas entre etapas |

---

## Features P2 (Pos-validacao, abril-junho)

| Feature | Epic |
|---------|------|
| E3-F14: Telegram bot (fallback/testes) | E3 |
| E4-F11: Reativacao de leads | E4 |
| E7-F5: API de conversoes Meta | E7 |
| E8-F3: Performance por corretor | E8 |
| E8-F4: Performance por campanha | E8 |
| E8-F5: Motivos de perda | E8 |
| E8-F6: Tempo medio de ciclo | E8 |

---

## Gaps Identificados

### Gap 1: Telegram vs WhatsApp — Ambiguidade no PRD
O PRD nao resolve de forma clara se o MVP de sexta e Telegram ou WhatsApp. A timeline fala Telegram, os Epics falam Cloud API. **Decisao necessaria: depende do acesso ao Meta Business.** O @pm deve atualizar o PRD para refletir a estrategia condicional (Cloud API first, Telegram fallback).

### Gap 2: Tabela `whatsapp_instances` referencia Z-API
Na secao 3.2 do PRD, a tabela `whatsapp_instances` ainda usa terminologia Z-API (`instance_type`, `z-api`). Com Cloud API + Coexistence Mode, essa tabela precisa ser renomeada/reestruturada para `whatsapp_config` ou similar, com campos: `waba_id`, `phone_number_id`, `access_token`, `verify_token`, `coexistence_enabled`, `webhook_url`.

### Gap 3: Fluxo de Coexistence Mode nao detalhado
O PRD menciona Coexistence Mode mas nao detalha o fluxo tecnico:
- Como o sistema detecta que o corretor respondeu pelo WhatsApp Business App (Messaging Echoes webhook)?
- Como o sistema diferencia mensagem do agente Nicole vs mensagem do corretor?
- Qual o sender_type no banco: `ai` (Nicole via Cloud API) vs `broker` (corretor via WhatsApp Business App)?
- E se o corretor e a Nicole tentarem responder ao mesmo tempo?

O @sm precisa detalhar isso nas stories do E7-F3 e E3-F9.

### Gap 4: Dados reais da Trifold pendentes
O catalogo de requisitos lista dados que precisamos pedir a Trifold (mapa de unidades, vista por posicao, unidades vendidas/reservadas, precos, plantas). Esses dados impactam E2-F5 e E2-F6. Se nao chegarem ate quarta, o seed sera generico.

### Gap 5: Sem mencionamento de rate limiting / retry no Cloud API adapter
Com Coexistence Mode, o throughput cai para 20 msg/s (ou 5 msg/s em algumas implementacoes). O PRD nao menciona rate limiting, retry com backoff, ou fila de mensagens. Para o volume da Trifold (fase validacao) isso nao e problema, mas precisa estar no design.

### Gap 6: Fluxo de Messaging Echoes nao descrito
Quando o corretor responde pelo WhatsApp Business App, a Meta envia um webhook de Messaging Echoes. O PRD nao descreve:
- Como capturar essas mensagens no CRM
- Como vincular ao lead correto (por phone number do destinatario)
- Como exibir no historico de conversa (sender_type = broker)
- Isso e parte do E7-F3 mas precisa de stories detalhadas

---

## Riscos de Entrega

### Risco 1: Acesso ao Meta Business (BLOQUEANTE)
**Probabilidade: ALTA | Impacto: CRITICO**
Se a Trifold nao der acesso ao Meta Business Manager ate terca 01/04, o Cloud API nao sera configurado a tempo. O numero oficial precisa ser registrado na WABA, Business Verification precisa estar completa, e o Coexistence Mode precisa ser habilitado.
**Mitigacao:** Solicitar acesso HOJE. Se nao vier, usar Telegram como canal para a demo de sexta e migrar na semana seguinte.

### Risco 2: 51 features P0 em 4 dias (ALTO)
**Probabilidade: MEDIA | Impacto: ALTO**
51 features em 4 dias e agressivo mesmo com 85% de base do agente-linda. A maioria e adaptacao, mas o volume e grande.
**Mitigacao:** Priorizar dentro do P0. Se algo nao ficar pronto:
- **Inegociavel:** Nicole conversando + qualificacao + guardrails + pipeline kanban + painel admin basico
- **Pode ficar parcial:** Filtros avancados, gestao de corretores, activity logs, Meta Ads webhook
- **Pode sair do P0:** E3-F7 (envio materiais), E3-F8 (agendamento) — podem ser P1 se o tempo apertar

### Risco 3: Seeds dependem de dados reais
**Probabilidade: ALTA | Impacto: MEDIO**
Se os dados reais nao chegarem, a demo mostra dados ficticios. Nao e bloqueante mas reduz impacto da demo.
**Mitigacao:** Usar dados estimados baseados no que ja sabemos (48 un Vind, 60 un Yarden, tipologias conhecidas). Pedir a Trifold na reuniao de terca.

### Risco 4: Business Verification da Meta pode demorar
**Probabilidade: MEDIA | Impacto: ALTO**
A verificacao de negocio da Meta pode levar de 1 dia a 2 semanas. Se a Trifold nao tiver a conta verificada, o Cloud API fica limitado.
**Mitigacao:** Verificar o status atual da conta Meta Business da Trifold. Se ja estiver verificada (provavel, ja fazem Meta Ads), o setup e rapido. Se nao, iniciar verificacao imediatamente.

### Risco 5: Coexistence Mode e relativamente novo
**Probabilidade: BAIXA | Impacto: MEDIO**
Coexistence Mode foi lancado em maio/2025 e pode ter edge cases nao documentados. O throughput limitado (20 msg/s) e uma limitacao conhecida mas aceitavel para o volume da Trifold.
**Mitigacao:** Testar Coexistence Mode com numero de teste antes de conectar o numero oficial.

---

## Decisoes do PO

### Decisao 1: Canal de comunicacao para sexta
**Cloud API e o target.** Se o acesso ao Meta Business nao chegar ate terca 01/04, Telegram como fallback para a demo. O @dev implementa um adapter pattern que permite trocar o canal sem reescrever a logica (isso ja existe no agente-linda).

### Decisao 2: Z-API eliminada do MVP
Todas as referencias a Z-API devem ser removidas do PRD. A pesquisa de integracao deixou claro: Z-API tem risco critico de banimento, nao suporta CTWA Ads, e viola TOS do WhatsApp. Cloud API + Coexistence Mode cobre 100% dos requisitos.

### Decisao 3: Prioridade condicional do E3-F14 (Telegram)
Se Cloud API estiver disponivel: E3-F14 permanece P2.
Se Cloud API NAO estiver disponivel para sexta: E3-F14 sobe para P0.

### Decisao 4: Envio de materiais e agendamento podem ser P0-parcial
E3-F7 (envio materiais) e E3-F8 (agendamento) sao P0 no PRD, mas se o tempo apertar, podem ser entregues de forma simplificada:
- Materiais: Nicole menciona que pode enviar mas envia link generico (em vez de planta especifica da tipologia)
- Agendamento: Nicole coleta disponibilidade e registra no sistema, mas sem integracao com Google Calendar

### Decisao 5: Seed generico e aceitavel para sexta
Se dados reais nao chegarem, seed generico com:
- Todas unidades como "disponiveis"
- Posicoes e vistas estimadas (frente/fundos alternando)
- Precos nao preenchidos (admin insere depois)
- Plantas e renders como placeholder ("solicite ao corretor")

### Decisao 6: Titulo do Epic 7 corrigido
Epic 7 deve ser renomeado de "Integracoes (Z-API/WhatsApp)" para "Integracoes (Meta/WhatsApp Cloud API)".

---

## Acoes para o @pm (Morgan) antes de liberar pro @sm

1. **Resolver ambiguidade Telegram vs Cloud API** — atualizar timeline e entregas P0 com a estrategia condicional
2. **Remover todas as referencias a Z-API** — trocar por Cloud API + Coexistence Mode
3. **Reestruturar tabela `whatsapp_instances`** — adaptar para Cloud API (waba_id, phone_number_id, etc.)
4. **Atualizar fluxo tecnico (secao 4.2)** — trocar "Telegram Webhook" por "Cloud API Webhook" (com nota de fallback Telegram)
5. **Adicionar fluxo de Messaging Echoes** — descrever como mensagens do corretor via WhatsApp Business App sao capturadas
6. **Renomear Epic 7** — "Integracoes (Meta/WhatsApp Cloud API)"

**Nota:** Essas correcoes podem ser feitas em paralelo com o @sm criando stories. Os gaps identificados sao de documentacao, nao de escopo. O @sm pode comecar a trabalhar nas stories dos Blocos 1-3 imediatamente.

---

## Veredicto Final

**APPROVED — Pode ir pro @sm criar stories.**

O PRD cobre o escopo necessario. Os epics estao bem definidos. O modelo de dados esta completo. As regras de negocio estao corretas. A prioridade P0/P1/P2 faz sentido para a deadline de sexta.

Os ajustes obrigatorios listados acima sao correcoes de consistencia interna (Telegram vs Cloud API, referencias a Z-API) que o @pm pode fazer em paralelo sem bloquear o @sm.

**O @sm pode comecar a criar stories imediatamente, priorizando:**
1. Bloco 1 (Fundacao) — stories para hoje/amanha
2. Bloco 3 (Nicole Conversacional) — stories para terca/quarta
3. Bloco 4 (CRM/Pipeline) — stories para quarta/quinta
4. Bloco 5 (Paineis) — stories para quinta/sexta

**Dependencia critica bloqueante:** Solicitar acesso ao Meta Business Manager da Trifold HOJE.

---

*@po (Pax) — AIOS Pipeline — 31/03/2026*
