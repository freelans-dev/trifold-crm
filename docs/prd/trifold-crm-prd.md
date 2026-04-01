# PRD -- Trifold CRM (Nicole) v1.0

**Versao:** 1.1
**Data:** 31/03/2026
**Autor:** @pm (Morgan) -- AIOS Pipeline
**Base:** Project Brief v1.0, Catalogo de Unidades Requisitos, Requisitos de Projeto (reunioes 30-31/03)
**Proximo passo:** @po (Pax) valida epics e prioriza backlog

---

## 1. Resumo do Produto

### Visao

O Trifold CRM e uma plataforma de CRM imobiliario com agente de IA conversacional (Nicole) que transforma o atendimento comercial da Trifold Engenharia. O sistema substitui 4 tentativas fracassadas de chatbot com uma solucao construida especificamente para o mercado imobiliario: qualifica leads automaticamente, responde duvidas sobre empreendimentos, agenda visitas ao stand de vendas, e oferece pipeline completo de gestao com supervisao em tempo real.

### Proposta de Valor

- **Para supervisores/gestao:** Controle total sobre conversas, treinamento da IA, metricas de conversao e performance por corretor
- **Para corretores:** Pipeline proprio com leads pre-qualificados, resumo IA da conversa, contexto completo antes do atendimento
- **Para leads/clientes:** Atendimento 24/7, respostas instantaneas, envio de plantas e materiais, agendamento de visitas sem friccao

### ICP (Ideal Customer Profile)

**Organizacao:** Construtoras/incorporadoras de medio porte (3-10 empreendimentos ativos) com equipe comercial enxuta (2-10 corretores) e investimento em trafego pago (Meta Ads). Maturidade digital baixa-media (1-3/5), ciclo de venda longo com fechamento presencial obrigatorio.

**Cliente piloto:** Trifold Engenharia (Maringa-PR) -- 3 empreendimentos, 48+60 unidades, equipe de corretores internos, lancamento Yarden em julho/2026.

### Diferenciais vs concorrentes fracassados

| Solucao | Problema | Nicole resolve |
|---------|----------|---------------|
| Bots de fluxo | "Obvio que e bot", sem inteligencia | IA conversacional natural, personalidade propria |
| ChatGPT direto | "Nao responde o que precisa, muito tecnica" | Prompts calibrados para imobiliario, guardrails rigorosos |
| Lais | Transbordo desestruturado, sem integracao CRM | Handoff transparente + CRM proprio integrado |
| Zenvia | Nao envia arquivos, nao qualifica, bot obvio | Envio de plantas/renders, qualificacao com regras de negocio |

---

## 2. Epics e Features

### Epic 1 -- Setup e Infraestrutura

**Objetivo:** Criar toda a base tecnica do projeto a partir do agente-linda, com ambiente de desenvolvimento, staging e producao prontos.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E1-F1 | **Repositorio GitHub** | Criar repo `trifold-crm` na org `freelans-dev`, monorepo com Turborepo (packages/web, ai, db, bot, shared) | P0 | Baixa | Reusar |
| E1-F2 | **Supabase novo** | Criar projeto Supabase em conta nova do cliente. Schema adaptado do agente-linda com entidades imobiliarias | P0 | Media | Adaptar |
| E1-F3 | **Vercel deploy** | Setup Vercel com auto-deploy via push to `main`. Dominio temporario, futuro `crm.3fold` | P0 | Baixa | Reusar |
| E1-F4 | **WhatsApp Cloud API setup** | Configurar Cloud API no numero oficial Meta da Trifold. Webhook receiver, verificacao de token, Coexistence Mode habilitado pra corretores usarem WhatsApp Business App no celular | P0 | Media | Adaptar |
| E1-F5 | **Environment variables** | Configurar envs para Supabase, Anthropic API, Meta Cloud API (WABA ID, phone number ID, access token, verify token), Vercel | P0 | Baixa | Reusar |
| E1-F6 | **Auth e roles** | Supabase Auth com roles: admin, supervisor, broker. RLS policies por organizacao e role | P0 | Media | Adaptar |
| E1-F7 | **Seed de dados iniciais** | Organizacao Trifold, usuario admin (Alexandre), pipeline stages default, empreendimentos Vind e Yarden | P0 | Baixa | Novo |

---

### Epic 2 -- Catalogo de Empreendimentos e Unidades

**Objetivo:** Sistema completo de cadastro e consulta de empreendimentos, tipologias e unidades individuais. Core do negocio -- alimenta a Nicole e os corretores.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E2-F1 | **CRUD empreendimentos** | Cadastro completo: nome, status (lancamento/comercializacao/entregue), endereco, lat/lng, conceito, proposta de valor, data de entrega, total de unidades, total de andares, unidades por andar, amenities (areas de lazer), FAQ aprovado, restricoes (o que IA NAO pode dizer), regras comerciais (exige entrada?, MCMV?, faixa de preco) | P0 | Media | Adaptar |
| E2-F2 | **CRUD tipologias** | Cadastro por empreendimento: nome (ex: "2 suites"), metragem privativa, metragem total, num dormitorios, num suites, num banheiros, sacada (sim/nao, com churrasqueira?), planta baixa (upload PDF/imagem), planta humanizada (upload), diferenciais | P0 | Media | Novo |
| E2-F3 | **CRUD unidades individuais** | Cadastro por empreendimento e tipologia: identificacao (ex: "1501"), andar, posicao no andar (frente/fundos/lateral), vista (rua/interna/bosque/nascente/poente), num vagas garagem, tipo garagem (normal/gaveta/dupla/coberta/descoberta), metragem garagem, metragem privativa (pode variar da tipologia), status (disponivel/reservado/vendido), preco tabela (oculto da IA), observacoes | P0 | Alta | Novo |
| E2-F4 | **Filtros de unidades** | Filtrar por: empreendimento, tipologia, status, faixa de andar, vista, num garagens, tipo garagem, faixa de preco (admin only) | P0 | Media | Novo |
| E2-F5 | **Seed Vind** | 48 unidades: 12 pavimentos tipo x 4 un/andar. Tipologia unica: 67m2, 2 suites, sacada ampla c/ churrasqueira, 1 vaga coberta. Status por unidade (disponivel/reservado/vendido -- dados da Trifold) | P0 | Baixa | Novo |
| E2-F6 | **Seed Yarden** | 60 unidades: 15 pavimentos tipo x 4 un/andar. 2 tipologias: A (83,66m2) e B (79,81m2). Opcao 2 suites ou 2 dorm + 1 suite. Garagem 1 vaga (11,25m2) ou 2 vagas (22,50m2). Status inicial: todas disponiveis | P0 | Baixa | Novo |
| E2-F7 | **Upload de materiais** | Upload de plantas (PDF/imagem), renders, fotos e videos por empreendimento e por tipologia. Supabase Storage com buckets organizados por empreendimento | P1 | Media | Adaptar |
| E2-F8 | **Galeria de empreendimento** | Visualizacao de fotos, renders e videos no painel. Cards com preview, modal de visualizacao | P1 | Baixa | Adaptar |

---

### Epic 3 -- Agente Nicole (IA Conversacional)

**Objetivo:** Agente inteligente que atende leads via WhatsApp Cloud API (numero oficial Meta da Trifold), qualifica com regras do mercado imobiliario, e faz handoff transparente para corretores via Coexistence Mode (corretor responde pelo WhatsApp Business App no celular).

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E3-F1 | **Personalidade Nicole** | Prompts que definem: simpatica, "boa praca", natural (NAO robotica). Tom: informar o suficiente para despertar interesse, nunca o bastante para o lead decidir sem visitar. Gatilhos de convite ("venha tomar um cafe", "conheca o decorado") | P0 | Media | Adaptar |
| E3-F2 | **Base de conhecimento RAG** | Embeddings (pgvector) com dados dos empreendimentos: localizacao, conceito, diferenciais, metragem, tipologias, lazer, prazo de entrega, FAQ aprovado. Alimentado pelo catalogo (Epic 2) + base NLU existente (22 pares pergunta-resposta) | P0 | Media | Adaptar |
| E3-F3 | **Identificacao de empreendimento** | Nicole identifica qual empreendimento interessa ao lead (Vind, Yarden, ou nao sabe). Se nao sabe, apresenta opcoes com diferenciais de cada um | P0 | Baixa | Adaptar |
| E3-F4 | **Qualificacao de leads** | Coleta progressiva (nao formulario): nome, empreendimento de interesse, num quartos, preferencia de andar (alto/baixo), preferencia de vista, num garagens, tem entrada disponivel (obrigatorio para Yarden), como conheceu a Trifold, disponibilidade para visita | P0 | Alta | Adaptar |
| E3-F5 | **Regra de entrada Yarden** | Lead sem entrada disponivel NAO qualifica para Yarden. Nicole informa com empatia que entrada e necessaria, sugere conhecer o Vind ou manter contato para oportunidades futuras | P0 | Baixa | Novo |
| E3-F6 | **Guardrails da IA** | NAO prometer materiais/acabamentos especificos (memorial descritivo pode mudar). NAO simular financiamento. NAO expor memorial descritivo tecnico. NAO enviar tabela de precos exata. NAO revelar que e IA/bot. Resposta padrao para perguntas fora do escopo: redirecionar para visita | P0 | Media | Adaptar |
| E3-F7 | **Envio de materiais** | Nicole envia plantas, renders, fotos quando solicitado. Sempre acompanha com convite para visita presencial. Materiais vinculados ao empreendimento/tipologia de interesse | P0 | Media | Adaptar |
| E3-F8 | **Agendamento de visitas** | Propor horario para visita ao stand de vendas. Confirmar data/hora. Registrar no sistema. Notificar corretor designado | P0 | Media | Adaptar |
| E3-F9 | **Handoff transparente** | Transbordo invisivel para o lead. Corretor recebe: resumo IA da conversa, preferencias extraidas, score de qualificacao, historico completo. Criterios de handoff: lead qualificado + quer valores detalhados, quer simulacao, agendou visita, pergunta fora do escopo, supervisao solicita | P0 | Alta | Adaptar |
| E3-F10 | **WhatsApp Cloud API adapter** | Recebimento de mensagens via webhook Meta, envio de texto/midia/templates. Suporte a Click-to-WhatsApp Ads (referral data). Coexistence Mode pra handoff ao corretor via WhatsApp Business App. Janela 24h/72h awareness | P0 | Media | Adaptar |
| E3-F11 | **Horario comercial** | Mensagem personalizada fora do horario. Configuravel pelo admin: dias, horarios, mensagem. Fora do horario: Nicole informa que vai responder no proximo dia util e coleta dados basicos | P0 | Baixa | Reusar |
| E3-F12 | **Estado da conversa** | Persistencia do estado (em qual etapa da qualificacao esta, o que ja foi coletado, ultimo empreendimento discutido). Retomada natural da conversa apos pausas | P0 | Media | Adaptar |
| E3-F13 | **Model selector** | Sonnet para conversas complexas (qualificacao, FAQ detalhado), Haiku para tarefas leves (classificacao de intent, extracao de dados) | P1 | Baixa | Reusar |
| E3-F14 | **Telegram bot (fallback/testes)** | Bot Telegram opcional para testes internos e desenvolvimento. Mesma logica do Cloud API adapter | P2 | Baixa | Novo |

---

### Epic 4 -- CRM e Pipeline

**Objetivo:** Pipeline visual de gestao de leads com etapas configuráveis, historico completo e designacao a corretores.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E4-F1 | **Pipeline kanban** | Board visual com drag-and-drop. Etapas default: Novo, Qualificado, Agendado, Visitou, Negociando, Fechou, Perdido. Cards com: nome do lead, empreendimento de interesse, corretor designado, tempo na etapa, score de qualificacao | P0 | Media | Adaptar |
| E4-F2 | **Etapas configuraveis** | Admin pode criar/editar/reordenar etapas do pipeline. Cada etapa com: nome, cor, posicao, se e etapa final (ganho/perdido) | P0 | Baixa | Adaptar |
| E4-F3 | **Filtros do pipeline** | Filtrar leads por: empreendimento de interesse, com/sem corretor designado, com/sem produto vinculado, origem (Meta Ads/site/indicacao), data de entrada, score de qualificacao | P0 | Media | Novo |
| E4-F4 | **Lead management** | CRUD completo de leads. Campos: nome, telefone, email, origem, UTM params, empreendimento de interesse, tipologia de interesse, preferencias (andar, vista, garagem), tem entrada, status de qualificacao, score, corretor designado, notas, ai_summary | P0 | Media | Adaptar |
| E4-F5 | **Detalhe do lead** | Pagina completa com: dados do lead, preferencias, historico da conversa (agente + corretor), resumo IA, timeline de atividades, empreendimento/unidade de interesse, notas do corretor | P0 | Media | Adaptar |
| E4-F6 | **Designacao de leads a corretores** | Designar lead a corretor manualmente. Filtro por empreendimento (corretor so ve leads dos empreendimentos que atende). Notificacao ao corretor quando recebe novo lead | P0 | Media | Adaptar |
| E4-F7 | **Conversa do agente visivel** | No detalhe do lead, exibir conversa completa (agente + lead + corretor + supervisor). Mensagens com timestamp, sender type (ai/lead/broker/supervisor), midia enviada | P0 | Media | Reusar |
| E4-F8 | **Resumo IA da conversa** | Resumo automatico gerado pela IA com: preferencias do lead, perguntas feitas, objecoes levantadas, nivel de interesse percebido, proximos passos recomendados. Atualizado a cada interacao significativa | P0 | Media | Reusar |
| E4-F9 | **Activity logs** | Timeline de atividades por lead: mudanca de etapa, designacao a corretor, notas adicionadas, visita agendada, visita realizada, handoff, status change. Cada entry com timestamp, autor, tipo, descricao | P0 | Baixa | Adaptar |
| E4-F10 | **Interesse em unidade especifica** | Vincular lead a unidade(s) especifica(s) de interesse. Exibir no detalhe do lead e no card do pipeline | P1 | Baixa | Novo |
| E4-F11 | **Reativacao de leads** | Marcar leads como "frio" apos X dias sem interacao. Lista de leads frios para campanha de reativacao. Envio de mensagem de reativacao via agente | P2 | Media | Novo |

---

### Epic 5 -- Painel Administrativo

**Objetivo:** Interface para supervisores configurarem a IA, gerenciarem empreendimentos, monitorarem conversas e controlarem todo o sistema.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E5-F1 | **Dashboard principal** | Metricas chave: total de leads (hoje/semana/mes), leads qualificados, visitas agendadas, taxa de qualificacao, leads por etapa do pipeline, leads sem corretor, ultimas conversas ativas | P0 | Media | Adaptar |
| E5-F2 | **Treinamento da IA** | Interface para editar base de conhecimento: adicionar/editar/remover pares pergunta-resposta, categorizar por empreendimento ou geral, definir prioridade, ativar/desativar. Re-gerar embeddings ao salvar | P0 | Media | Reusar |
| E5-F3 | **Configuracao da personalidade** | Editar prompt principal da Nicole: personalidade, tom, restricoes, guardrails ativos. Preview de como a Nicole responderia a perguntas de teste | P0 | Media | Reusar |
| E5-F4 | **Gestao de corretores** | CRUD de corretores: nome, email, telefone pessoal, numero Trifold vinculado (obrigatorio), empreendimentos que atende, status (ativo/inativo). Vincular corretor a 1+ empreendimentos | P0 | Media | Novo |
| E5-F5 | **Monitoramento de conversas** | Lista de conversas ativas em tempo real (Supabase Realtime). Ver conversa completa. Indicador de status (agente atendendo / corretor atendendo / aguardando). Filtrar por empreendimento, corretor, status | P0 | Alta | Adaptar |
| E5-F6 | **Configuracao de pipeline** | Gerenciar etapas do kanban: criar, editar nome/cor, reordenar, definir etapas finais. Etapas default pre-criadas no seed | P0 | Baixa | Adaptar |
| E5-F7 | **Gestao de empreendimentos** | Interface para Epic 2 (CRUD empreendimentos, tipologias, unidades). Tabs: Info Geral, Tipologias, Unidades, Materiais, FAQ, Regras Comerciais | P0 | Alta | Adaptar |
| E5-F8 | **Intervencao em conversa** | Supervisor pode: enviar mensagem direta ao lead (como Nicole ou como supervisor), enviar instrucao privada ao corretor (so corretor ve), assumir conversa temporariamente | P1 | Alta | Novo |
| E5-F9 | **Config handoff** | Configurar regras de transbordo: tempo maximo de espera, criterios automaticos (score minimo, perguntas sobre preco), horarios de transbordo, corretor padrao por empreendimento | P1 | Media | Adaptar |
| E5-F10 | **Config horario comercial** | Definir dias e horarios de atendimento. Mensagem personalizada fora do horario. Modo: responder sempre / so no horario / basico fora do horario | P0 | Baixa | Reusar |

---

### Epic 6 -- Painel do Corretor

**Objetivo:** Interface simplificada para corretores verem seus leads, acompanharem conversas e registrarem feedback.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E6-F1 | **Login corretor** | Autenticacao com role `broker`. Redirect automatico para painel do corretor (nao ve admin). Email + senha via Supabase Auth | P0 | Baixa | Adaptar |
| E6-F2 | **Pipeline proprio** | Kanban identico ao admin, mas filtrado apenas para leads designados ao corretor logado. Mesma funcionalidade de drag-and-drop e filtros | P0 | Media | Adaptar |
| E6-F3 | **Lista de leads** | Leads designados ao corretor com: nome, empreendimento, etapa, ultimo contato, score. Ordenar por data, etapa, score | P0 | Baixa | Adaptar |
| E6-F4 | **Detalhe do lead** | Mesma pagina de detalhe do admin (E4-F5) com: dados, conversa do agente, resumo IA, timeline. Corretor pode adicionar notas | P0 | Media | Adaptar |
| E6-F5 | **Resumo IA do lead** | Resumo automatico visivel no topo do detalhe: preferencias, perguntas feitas, objecoes, nivel de interesse. "O que voce precisa saber antes de ligar" | P0 | Baixa | Reusar |
| E6-F6 | **Feedback pos-visita** | Corretor registra resultado da visita: compareceu (sim/nao), interesse (alto/medio/baixo/perdido), notas em texto livre, upload de audio (transcricao IA). Resultado atualiza pipeline automaticamente | P1 | Media | Novo |
| E6-F7 | **Notificacoes** | Notificacao de novo lead designado (in-app + browser push). Notificacao de visita agendada. Notificacao de instrucao do supervisor | P1 | Media | Adaptar |
| E6-F8 | **Conversa do agente** | Visualizar toda a conversa que o agente teve com o lead antes do handoff. Destacar informacoes chave extraidas (nome, preferencias, objecoes) | P0 | Baixa | Reusar |

---

### Epic 7 -- Integracoes

**Objetivo:** Conectar o sistema com canais de aquisicao (Meta Ads) e comunicacao (Z-API/WhatsApp).

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E7-F1 | **Meta Ads webhook** | Endpoint para receber leads de formularios do Facebook/Instagram. Criar lead automaticamente no pipeline (etapa "Novo"). Capturar UTM params (campaign, source, medium, content) | P0 | Media | Novo |
| E7-F2 | **Tracking de origem** | Salvar origem do lead (meta_ads/telegram/site/indicacao/reativacao) + UTM params. Exibir origem no card do lead e nos filtros do pipeline | P0 | Baixa | Novo |
| E7-F3 | **Cloud API Coexistence Mode** | Habilitar Coexistence Mode no numero oficial. Corretores instalam WhatsApp Business App e vinculam ao numero da Trifold. Mensagens do corretor sincronizam via Messaging Echoes webhook. Sistema captura TUDO (agente + corretor) | P0 | Media | Novo |
| E7-F4 | **Click-to-WhatsApp Ads** | Capturar referral data (campaign_id, ad_id, ctwa_clid) quando lead vem de anuncio Meta. Janela de 72h gratis. Vincular lead a campanha/criativo de origem | P1 | Media | Novo |
| E7-F5 | **API de conversoes Meta** | Enviar eventos de conversao de volta pro Meta Ads (lead qualificado, visita agendada, visita realizada, fechamento). Permite otimizacao de campanhas por evento de qualidade | P2 | Media | Novo |

---

### Epic 8 -- Analytics e Relatorios

**Objetivo:** Metricas de conversao, performance e ROI para tomada de decisao.

| ID | Feature | Descricao | Prioridade | Complexidade | Base agente-linda |
|----|---------|-----------|-----------|-------------|-------------------|
| E8-F1 | **Leads por periodo** | Grafico de leads recebidos por dia/semana/mes. Filtro por empreendimento, origem, corretor | P1 | Media | Adaptar |
| E8-F2 | **Funil de conversao** | Taxas entre etapas: qualificacao (qualificados/total), agendamento (agendados/qualificados), comparecimento (visitaram/agendados), fechamento (fecharam/visitaram). Visualizacao em funil | P1 | Media | Novo |
| E8-F3 | **Performance por corretor** | Leads recebidos, qualificados, agendados, visitados, fechados por corretor. Taxa de conversao individual. Ranking | P2 | Media | Novo |
| E8-F4 | **Performance por campanha** | Pos-integracao Meta Ads: leads por campanha/conjunto/criativo. Custo por lead qualificado. Leads que viraram visita e fechamento por campanha | P2 | Media | Novo |
| E8-F5 | **Motivos de perda** | Categorizar leads perdidos: sem entrada, sem interesse, comprou concorrente, fora do perfil, sem retorno. Graficos de motivos mais frequentes | P2 | Baixa | Novo |
| E8-F6 | **Tempo medio de ciclo** | Dias medios entre: entrada e qualificacao, qualificacao e visita, visita e fechamento. Por empreendimento e por corretor | P2 | Media | Novo |

---

## 3. Modelo de Dados

### 3.1 Tabelas Novas (nao existem no agente-linda)

#### `properties` (empreendimentos)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| org_id | uuid (FK → organizations) | Sim | Organizacao dona |
| name | varchar(255) | Sim | Nome do empreendimento (ex: "Vind Residence") |
| slug | varchar(255) | Sim | Slug unico (ex: "vind-residence") |
| status | enum | Sim | `launching` / `selling` / `building` / `delivered` |
| address | text | Sim | Endereco completo |
| neighborhood | varchar(255) | Nao | Bairro |
| city | varchar(255) | Sim | Cidade |
| state | varchar(2) | Sim | Estado (UF) |
| lat | decimal | Nao | Latitude |
| lng | decimal | Nao | Longitude |
| google_maps_url | text | Nao | Link Google Maps |
| concept | text | Nao | Conceito / proposta de valor |
| description | text | Nao | Descricao completa |
| differentials | jsonb | Nao | Lista de diferenciais |
| amenities | jsonb | Nao | Areas de lazer (lista detalhada) |
| delivery_date | date | Nao | Data de entrega prevista |
| total_units | integer | Nao | Total de unidades |
| total_floors | integer | Nao | Total de andares (tipo + lazer + subsolo) |
| units_per_floor | integer | Nao | Unidades por andar |
| type_floors | integer | Nao | Pavimentos tipo |
| basement_floors | integer | Nao | Pavimentos subsolo |
| leisure_floors | integer | Nao | Pavimentos de lazer |
| faq | jsonb | Nao | Array de {question, answer, active} |
| restrictions | jsonb | Nao | O que a IA NAO pode dizer |
| commercial_rules | jsonb | Nao | {requires_down_payment, min_down_payment, mcmv_eligible, price_range_visible, general_price_range} |
| cnpj | varchar(20) | Nao | CNPJ da filial |
| video_tour_url | text | Nao | URL do video tour |
| is_active | boolean | Sim | Se esta ativo no sistema |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

#### `typologies` (tipologias / modelos de planta)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| property_id | uuid (FK → properties) | Sim | Empreendimento |
| name | varchar(255) | Sim | Nome (ex: "2 suites", "Tipologia A") |
| private_area_m2 | decimal(8,2) | Nao | Metragem privativa |
| total_area_m2 | decimal(8,2) | Nao | Metragem total |
| bedrooms | integer | Nao | Numero de dormitorios |
| suites | integer | Nao | Numero de suites |
| bathrooms | integer | Nao | Numero de banheiros |
| has_balcony | boolean | Nao | Tem sacada |
| balcony_bbq | boolean | Nao | Sacada com churrasqueira |
| floor_plan_url | text | Nao | URL da planta baixa (Supabase Storage) |
| humanized_plan_url | text | Nao | URL da planta humanizada |
| differentials | jsonb | Nao | Diferenciais da tipologia |
| description | text | Nao | Descricao detalhada |
| is_active | boolean | Sim | Se esta ativa |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

#### `units` (unidades individuais)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| property_id | uuid (FK → properties) | Sim | Empreendimento |
| typology_id | uuid (FK → typologies) | Nao | Tipologia vinculada |
| identifier | varchar(50) | Sim | Identificacao (ex: "1501", "Torre A - 801") |
| floor | integer | Sim | Andar |
| position | varchar(50) | Nao | Posicao no andar (frente/fundos/lateral esq/lateral dir) |
| view_direction | varchar(100) | Nao | Vista (rua/interna/bosque/nascente/poente) |
| garage_count | integer | Sim | Numero de vagas de garagem |
| garage_type | varchar(50) | Nao | Tipo: normal / gaveta / dupla / coberta / descoberta |
| garage_area_m2 | decimal(8,2) | Nao | Metragem da garagem |
| private_area_m2 | decimal(8,2) | Nao | Metragem privativa (pode diferir da tipologia) |
| status | enum | Sim | `available` / `reserved` / `sold` |
| price | decimal(12,2) | Nao | Preco tabela (NAO visivel para IA, so admin/broker) |
| price_per_m2 | decimal(10,2) | Nao | Preco por m2 (calculado) |
| notes | text | Nao | Observacoes (ex: "unidade garden", "cobertura", "vista privilegiada") |
| reserved_by_lead_id | uuid (FK → leads) | Nao | Lead que reservou (se status = reserved) |
| reserved_at | timestamptz | Nao | Data da reserva |
| sold_at | timestamptz | Nao | Data da venda |
| is_active | boolean | Sim | Se esta ativa |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

#### `property_media` (fotos, renders, videos)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| property_id | uuid (FK → properties) | Sim | Empreendimento |
| typology_id | uuid (FK → typologies) | Nao | Tipologia (se especifico) |
| type | enum | Sim | `photo` / `render` / `video` / `floor_plan` / `document` |
| url | text | Sim | URL no Supabase Storage |
| title | varchar(255) | Nao | Titulo descritivo |
| description | text | Nao | Descricao |
| is_sendable | boolean | Sim | Se a Nicole pode enviar ao lead |
| sort_order | integer | Nao | Ordem de exibicao |
| created_at | timestamptz | Sim | Data de criacao |

#### `brokers` (extensao de users para dados de corretor)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| user_id | uuid (FK → users) | Sim | Usuario vinculado |
| org_id | uuid (FK → organizations) | Sim | Organizacao |
| trifold_phone | varchar(20) | Sim | Numero Trifold vinculado (NUNCA pessoal) |
| personal_phone | varchar(20) | Nao | Telefone pessoal (referencia interna) |
| type | enum | Sim | `internal` (2% comissao) / `external` (4.5% comissao) |
| specialties | jsonb | Nao | Empreendimentos que atende |
| is_active | boolean | Sim | Se esta ativo |
| max_leads | integer | Nao | Maximo de leads simultaneos |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

#### `broker_assignments` (corretor ↔ empreendimento)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| broker_id | uuid (FK → brokers) | Sim | Corretor |
| property_id | uuid (FK → properties) | Sim | Empreendimento |
| is_primary | boolean | Sim | Se e o corretor principal desse empreendimento |
| created_at | timestamptz | Sim | Data de criacao |

**Constraint:** UNIQUE(broker_id, property_id)

#### `lead_property_interest` (lead ↔ empreendimento/unidade)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| lead_id | uuid (FK → leads) | Sim | Lead |
| property_id | uuid (FK → properties) | Sim | Empreendimento de interesse |
| unit_id | uuid (FK → units) | Nao | Unidade especifica de interesse |
| typology_id | uuid (FK → typologies) | Nao | Tipologia de interesse |
| interest_level | enum | Nao | `high` / `medium` / `low` |
| notes | text | Nao | Observacoes |
| created_at | timestamptz | Sim | Data de criacao |

#### `visit_feedback` (feedback pos-visita)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| lead_id | uuid (FK → leads) | Sim | Lead |
| broker_id | uuid (FK → brokers) | Sim | Corretor que atendeu |
| visited | boolean | Sim | Compareceu a visita |
| interest_level | enum | Nao | `high` / `medium` / `low` / `lost` |
| notes | text | Nao | Notas em texto livre |
| audio_url | text | Nao | URL do audio gravado |
| audio_transcript | text | Nao | Transcricao IA do audio |
| next_steps | text | Nao | Proximos passos definidos |
| loss_reason | varchar(255) | Nao | Motivo de perda (se perdido) |
| visited_at | timestamptz | Nao | Data/hora da visita |
| created_at | timestamptz | Sim | Data de criacao |

---

### 3.2 Tabelas Adaptadas do agente-linda

#### `leads` (campos adicionais imobiliarios)

Campos existentes no agente-linda mantidos + novos campos:

| Campo novo | Tipo | Descricao |
|-----------|------|-----------|
| property_interest_id | uuid (FK → properties) | Empreendimento principal de interesse |
| has_down_payment | boolean | Tem entrada disponivel (qualificacao Yarden) |
| down_payment_range | varchar(50) | Faixa de entrada disponivel |
| preferred_bedrooms | integer | Num quartos desejado |
| preferred_floor | varchar(50) | Preferencia: alto / baixo / indiferente |
| preferred_view | varchar(100) | Preferencia de vista |
| preferred_garage_count | integer | Num garagens desejado |
| qualification_status | enum | `pending` / `qualified` / `disqualified` / `needs_info` |
| qualification_score | integer | Score 0-100 de qualificacao |
| disqualification_reason | varchar(255) | Motivo se desqualificado |
| source | enum | `meta_ads` / `telegram` / `whatsapp` / `site` / `referral` / `reactivation` |
| utm_campaign | varchar(255) | Campanha Meta Ads |
| utm_source | varchar(255) | Fonte |
| utm_medium | varchar(255) | Meio |
| utm_content | varchar(255) | Criativo |
| utm_term | varchar(255) | Termo |
| assigned_broker_id | uuid (FK → brokers) | Corretor designado |
| assigned_at | timestamptz | Quando foi designado |
| ai_summary | text | Resumo IA da conversa |
| visit_scheduled_at | timestamptz | Data/hora da visita agendada |
| visit_confirmed | boolean | Se confirmou a visita |
| last_interaction_at | timestamptz | Ultima interacao |
| is_cold | boolean | Se e lead frio (sem interacao > X dias) |

#### `kanban_stages` (etapas imobiliarias)

Etapas default para seed:

| Ordem | Nome | Cor | Tipo |
|-------|------|-----|------|
| 1 | Novo | #3B82F6 (azul) | entry |
| 2 | Em Qualificacao | #F59E0B (amarelo) | progress |
| 3 | Qualificado | #10B981 (verde) | progress |
| 4 | Visita Agendada | #8B5CF6 (roxo) | progress |
| 5 | Visitou | #06B6D4 (ciano) | progress |
| 6 | Negociando | #F97316 (laranja) | progress |
| 7 | Fechou | #22C55E (verde forte) | won |
| 8 | Perdido | #EF4444 (vermelho) | lost |

#### `agent_prompts` (prompts da Nicole)

Mantida estrutura do agente-linda. Prompts a criar:

| Prompt | Descricao |
|--------|-----------|
| `system_personality` | Personalidade Nicole: simpatica, boa praca, mercado imobiliario |
| `qualification_flow` | Fluxo de qualificacao progressiva |
| `property_presentation` | Como apresentar empreendimentos |
| `visit_scheduling` | Como agendar visitas ao stand |
| `handoff_summary` | Formato do resumo para corretor |
| `guardrails` | Restricoes ativas (memorial, preco, simulacao) |
| `off_hours` | Mensagem fora do horario |
| `reactivation` | Mensagem para leads frios |

#### `conversation_state` (estado da conversa)

Campos adicionais:

| Campo novo | Tipo | Descricao |
|-----------|------|-----------|
| current_property_id | uuid (FK → properties) | Empreendimento sendo discutido |
| qualification_step | varchar(50) | Etapa da qualificacao (collecting_name / collecting_interest / collecting_preferences / collecting_payment / qualified / scheduling_visit) |
| collected_data | jsonb | Dados ja coletados {name, property, bedrooms, floor, view, garage, down_payment, availability} |
| materials_sent | jsonb | Materiais ja enviados (evitar duplicidade) |
| visit_proposed | boolean | Se ja propos visita |

#### `whatsapp_instances` (Z-API)

Mantida estrutura do agente-linda. Campos relevantes:

| Campo | Descricao |
|-------|-----------|
| instance_type | `main` (agente Nicole) / `broker` (numero do corretor) |
| broker_id | FK → brokers (se tipo broker) |
| phone_number | Numero vinculado |
| status | `active` / `inactive` / `disconnected` |

---

### 3.3 Diagrama de Relacionamentos

```
organizations (1)
├── (N) users
│   └── (1) brokers
│       ├── (N) broker_assignments → (1) properties
│       └── (N) visit_feedback
├── (N) properties
│   ├── (N) typologies
│   │   └── (N) units
│   ├── (N) property_media
│   └── (N) units
├── (N) leads
│   ├── (N) lead_property_interest → properties / units / typologies
│   ├── (N) conversations
│   │   └── (N) messages
│   ├── (1) conversation_state
│   ├── (N) activities
│   └── (N) visit_feedback
├── (N) kanban_stages
├── (N) agent_prompts / agent_config
└── (N) knowledge_base → (?) properties
```

---

## 4. Fluxo Principal

### 4.1 Jornada do Lead (entrada ate fechamento)

```
[1] AQUISICAO
    Meta Ads / Instagram / Site / Indicacao
    ↓
    Lead clica → abre Telegram (MVP) ou WhatsApp (producao)
    ↓
    Webhook captura UTM params + cria lead no sistema (etapa: "Novo")

[2] ATENDIMENTO NICOLE
    ↓
    Nicole recepciona com simpatia
    ↓
    Identifica empreendimento de interesse (Vind / Yarden / nao sabe)
    ↓
    Responde FAQ (localizacao, conceito, diferenciais, prazo)
    ↓
    Envia materiais quando solicitado (planta, render) + convite para visita
    ↓
    Qualifica progressivamente:
    - Nome ✓
    - Empreendimento ✓
    - Preferencias (quartos, andar, vista, garagem) ✓
    - Tem entrada? (obrigatorio Yarden) ✓
    - Disponibilidade para visita ✓
    ↓
    [GATE] Tem entrada? (Yarden)
    ├── SIM → Continua qualificacao
    └── NAO → Registra como nao qualificado. Sugere Vind ou manter contato

[3] AGENDAMENTO
    ↓
    Nicole propoe visita ao stand ("Venha tomar um cafe, conhecer o decorado")
    ↓
    Confirma data/hora
    ↓
    Lead move para etapa "Visita Agendada"
    ↓
    Sistema designa corretor por empreendimento

[4] HANDOFF (transparente)
    ↓
    Corretor recebe:
    - Notificacao de novo lead
    - Resumo IA (preferencias, perguntas, objecoes, score)
    - Historico completo da conversa
    ↓
    Corretor assume no numero Trifold (lead nao percebe troca)

[5] VISITA AO STAND
    ↓
    Corretor atende presencialmente
    ↓
    Simulacao financeira (presencial)
    ↓
    Corretor registra feedback pos-visita (texto ou audio)
    ↓
    Lead move para "Visitou" → "Negociando" → "Fechou" ou "Perdido"

[6] SUPERVISAO (paralelo)
    ↓
    Supervisor monitora conversas em tempo real
    ↓
    Pode intervir (enviar instrucao ao corretor ou mensagem ao lead)
    ↓
    Dashboard com metricas de conversao
```

### 4.2 Fluxo tecnico do Telegram adapter

```
[Lead envia mensagem no Telegram]
    ↓
    Telegram Webhook → API Route /api/telegram/webhook
    ↓
    Identifica/cria lead pelo chat_id
    ↓
    Carrega conversation_state
    ↓
    Monta contexto: personality + knowledge_base (RAG) + guardrails + collected_data
    ↓
    Claude API (Sonnet/Haiku) gera resposta
    ↓
    Data extractor extrai dados da mensagem do lead
    ↓
    Atualiza conversation_state + lead
    ↓
    Salva messages (lead msg + agent msg)
    ↓
    Envia resposta via Telegram Bot API
    ↓
    Se criterio de handoff atingido → notifica corretor + muda status conversa
```

---

## 5. Regras de Negocio

### 5.1 O que a IA NAO pode fazer

| # | Restricao | Motivo | Severidade |
|---|-----------|--------|-----------|
| RN1 | NAO prometer materiais/acabamentos especificos | Memorial descritivo pode mudar durante obra; risco juridico | CRITICA |
| RN2 | NAO fazer simulacao financeira detalhada | Depende do perfil do cliente (renda, entrada); corretor e especialista | CRITICA |
| RN3 | NAO expor memorial descritivo tecnico | Informacao sensivel que gera expectativa juridica | CRITICA |
| RN4 | NAO enviar tabela de precos exata | Valores variam por unidade, andar, garagem; so corretor informa | ALTA |
| RN5 | NAO revelar que e IA/bot | Transbordo precisa ser transparente; lead nao pode saber que falava com IA | ALTA |
| RN6 | NAO inventar informacao que nao esta na base | Alucinar dados de empreendimentos e risco critico | CRITICA |

### 5.2 Regras de qualificacao

| # | Regra | Aplicacao |
|---|-------|-----------|
| RN7 | Sem entrada = nao qualifica para Yarden | Lead sem entrada disponivel nao e encaminhado ao corretor do Yarden |
| RN8 | Formas de pagamento: generico | "Entrada + parcelas, condicoes flexiveis" -- sem valores especificos |
| RN9 | Quanto mais info = menos visita | IA informa o suficiente para despertar interesse, NAO para saciar curiosidade |
| RN10 | Qualificacao progressiva | Nunca fazer formulario; coletar dados naturalmente na conversa |

### 5.3 Regras operacionais

| # | Regra | Descricao |
|---|-------|-----------|
| RN11 | Corretor usa numero Trifold | NUNCA o pessoal -- se corretor sair, dados ficam na empresa |
| RN12 | Conversas 100% registradas | Todo historico (agente + corretor + supervisor) fica no sistema |
| RN13 | Transbordo transparente | Cliente nao percebe que mudou de atendente |
| RN14 | Fechamento so presencial | Sistema direciona para visita, NUNCA para fechamento remoto |
| RN15 | Designacao por empreendimento | Cada corretor atende empreendimentos especificos |

### 5.4 Estrategia de comunicacao da Nicole

| Diretriz | Descricao |
|----------|-----------|
| Personalidade | Simpatica, "boa praca", natural -- NAO robotica |
| Estrategia | Despertar interesse sem saciar curiosidade |
| Gatilhos | Convidar para visita com diferencial ("venha tomar um cafe", "conheca o decorado") |
| Tom | Informar o suficiente para gerar desejo de visitar, nunca o bastante para decidir sem vir |
| Redirecionar | Sempre que possivel, direcionar a conversa para agendamento de visita presencial |

### 5.5 Regras de permissao de dados

| Dado | Nicole ve | Corretor ve | Admin ve |
|------|----------|------------|---------|
| Metragem, quartos, vista, andar, garagem | Sim | Sim | Sim |
| Localizacao, conceito, lazer, diferenciais | Sim | Sim | Sim |
| Plantas, renders, fotos | Sim (envia) | Sim | Sim |
| Preco especifico da unidade | NAO | Sim | Sim |
| Memorial descritivo | NAO | Sim | Sim |
| Status da unidade (disponivel/vendido) | Parcial (sabe se tem disponivel) | Sim | Sim |
| Historico do lead | Sim (proprio lead) | Sim (seus leads) | Sim (todos) |

---

## 6. Tech Stack

| Camada | Tecnologia | Versao/Detalhe |
|--------|-----------|---------------|
| **Frontend** | Next.js + React | Next.js 16, React 19 |
| **UI Components** | shadcn/ui + Tailwind CSS | v4 |
| **Backend** | Next.js API Routes + Server Actions | Monorepo |
| **Banco de dados** | Supabase (PostgreSQL) | pgvector para RAG, RLS para multi-tenant |
| **IA** | Claude (Anthropic) | Sonnet 4 para conversas, Haiku 3.5 para tarefas leves |
| **Embeddings** | pgvector | Embeddings via Anthropic ou OpenAI |
| **Chat (MVP + producao)** | WhatsApp Cloud API (Meta) | Numero oficial Trifold, Coexistence Mode, Click-to-WhatsApp Ads |
| **Chat fallback/testes** | Telegram Bot API | Webhook mode (opcional) |
| **Hosting** | Vercel (web) + VPS (bot) | Auto-deploy via push to main |
| **Auth** | Supabase Auth | Roles: admin, supervisor, broker |
| **Storage** | Supabase Storage | Plantas, renders, fotos, audios |
| **Realtime** | Supabase Realtime | Supervisao de conversas |
| **Monorepo** | Turborepo | packages/web, ai, db, bot, shared |
| **Agendamento** | Google Calendar API | Reuso do agente-linda |
| **Linguagem** | TypeScript | Strict mode |

### Custos estimados de infraestrutura

| Componente | Servico | Custo mensal estimado |
|-----------|---------|----------------------|
| Web app | Vercel Pro | ~$20/mes |
| Bot | VPS (Hetzner/Railway) | ~$5-10/mes |
| Banco de dados | Supabase Pro | ~$25/mes |
| IA (tokens Claude) | Anthropic API | ~$50-150/mes (volume dependente) |
| WhatsApp Cloud API | Meta (direto, sem BSP) | ~R$22-220/mes (por mensagem: service GRATIS, utility R$0,04, marketing R$0,36) |
| **Total estimado** | | **~R$500-800/mes** |

---

## 7. Timeline

### Sprint 0 -- Setup Infra (31/03 - 01/04)

| Task | Responsavel | Status |
|------|------------|--------|
| Criar repo GitHub (org freelans-dev) | @devops | Pendente |
| Setup Supabase (conta nova cliente) | @devops | Pendente |
| Setup Vercel (auto-deploy main) | @devops | Pendente |
| Configurar WhatsApp Cloud API (numero oficial Meta + Coexistence Mode) | @devops + Trifold (acesso ao Meta Business) | Pendente |
| Adaptar monorepo do agente-linda | @dev | Pendente |
| Configurar environment variables | @devops | Pendente |
| Migrations iniciais (schema base) | @dev | Pendente |

### Sprint 1 -- TUDO pra sexta (01/04 - 04/04)

**Meta: Prototipo funcional para apresentacao sexta 04/04 as 14h-15h**

| Dia | Foco | Entregas |
|-----|------|----------|
| 01/04 (ter) | Schema + Bot base | Migrations rodando, Telegram bot recebendo mensagens, schema de properties/typologies/units criado |
| 02/04 (qua) | Nicole + Catalogo | Nicole respondendo no Telegram com personalidade, base de conhecimento Vind e Yarden carregada, qualificacao basica funcionando |
| 03/04 (qui) | CRM + Painel | Pipeline kanban funcionando, painel admin com treinamento da IA, CRUD empreendimentos, gestao de corretores basica |
| 04/04 (sex) | Polish + Demo | Painel do corretor basico, filtros no pipeline, seed dos dados reais, ajustes finais, demo as 14h |

**Entregas P0 obrigatorias para sexta:**
- Nicole conversando no Telegram sobre Vind e Yarden
- Qualificacao de leads com regra de entrada
- Guardrails ativos (memorial, preco, simulacao)
- Pipeline kanban com drag-and-drop
- Filtros do pipeline (empreendimento, corretor, status)
- Painel admin (treinamento IA, empreendimentos, corretores)
- Painel corretor (pipeline proprio, leads, conversa do agente)
- Meta Ads webhook receiver
- Catalogo de unidades (Vind 48un + Yarden 60un) com seed real
- Handoff basico (notificacao ao corretor + resumo IA)

### Sprint 2 -- Validacao (04/04 - 11/04)

**Meta: Trifold testa por 1 semana. Gabriel coleta feedback e ajusta.**

| Foco | Descricao |
|------|-----------|
| Feedback loops | Reunioes rapidas com Lucas/Marcao para ajustes |
| Ajustes de prompt | Calibrar tom, respostas, guardrails baseado em conversas reais |
| Dados reais | Trifold alimenta base de conhecimento (FAQ, plantas, fotos) |
| Bugs | Corrigir issues encontrados durante uso real |
| Features P1 | Upload de materiais, galeria, model selector, notificacoes |

### Sprint 3+ -- Evolucao pre-lancamento Yarden (abril - junho 2026)

| Mes | Foco | Entregas |
|-----|------|----------|
| Abril | Estabilizacao + Z-API | Migracao Telegram → WhatsApp, Z-API numero principal, intervencao do supervisor |
| Maio | CRM completo | Analytics basico, feedback pos-visita, reativacao de leads, designacao inteligente |
| Junho | Meta Ads + Performance | Integracao Meta Ads completa, API de conversoes, dashboard de performance por corretor e campanha |
| **Julho** | **LANCAMENTO YARDEN** | **Sistema em producao recebendo leads reais do Yarden** |

### Deadlines criticos

| Marco | Data | Importancia |
|-------|------|------------|
| Prototipo funcional | **04/04/2026** | Demonstrar diferencial vs 4 tentativas anteriores |
| MVP Telegram validado | Abril/2026 | Provar que funciona antes de migrar pra WhatsApp |
| MVP WhatsApp rodando | Maio-Junho/2026 | Pronto para receber leads reais |
| **Lancamento Yarden** | **Julho/2026** | **DEADLINE INEGOCIAVEL -- sistema rodando em producao** |

---

## 8. Riscos

| # | Risco | Prob. | Impacto | Mitigacao |
|---|-------|-------|---------|-----------|
| R1 | **4 fracassos anteriores = ceticismo alto** | ALTA | CRITICO | Prototipo funcional na sexta 04/04; resultados visiveis imediatos; diferencial claro vs bots genericos |
| R2 | **Equipe Trifold com tempo limitado (4-5h/semana)** | ALTA | ALTO | Base pronta (70% reuso agente-linda); equipe refina, nao constroi do zero; reunioes presenciais focadas |
| R3 | **Deadline Yarden julho/2026** | MEDIA | CRITICO | Sprint agressivo; Telegram first (setup rapido); MVP conversacional antes do CRM completo |
| R4 | **IA alucinando informacoes sensiveis** | BAIXA | CRITICO | Guardrails rigorosos; base de conhecimento curada; restricoes de conteudo testadas; testes de stress antes de producao |
| R5 | **Base de conhecimento incompleta** | ALTA | ALTO | Comecar com FAQ basico (22 pares ja existem); iterar conforme equipe alimenta; priorizar empreendimentos ativos |
| R6 | **Z-API multi-instancia para corretores** | MEDIA | MEDIO | Validar viabilidade tecnica antes de prometer; comecar monitorando 1 numero; fase 2 |
| R7 | **Corretores nao adotarem o sistema** | MEDIA | ALTO | Painel simplificado; treinamento presencial; demonstrar valor (resumo IA economiza tempo do corretor) |
| R8 | **Alexandre viaja 2 semanas apos 04/04** | CONFIRMADO | MEDIO | Lucas/Marcao sao os operadores reais; decisoes criticas fechadas ate 04/04 |
| R9 | **Dependencia do agente-linda (technical debt)** | MEDIA | MEDIO | Schema novo e limpo; adaptar arquitetura, nao copiar debt; code review no setup |
| R10 | **Volume alto de tokens Claude no lancamento Yarden** | MEDIA | MEDIO | Model selector (Haiku para tarefas leves); cache de respostas frequentes; monitoramento de custos |

---

## 9. Metricas de Sucesso

### Metricas primarias (MVP -- a partir de abril/2026)

| Metrica | Como medir | Meta |
|---------|-----------|------|
| **Taxa de resposta < 1 min** | Mensagens respondidas em < 60s / total | > 95% |
| **Taxa de qualificacao** | Leads qualificados / total atendidos | > 30% |
| **Taxa de agendamento** | Visitas agendadas / leads qualificados | > 40% |
| **Taxa de comparecimento** | Visitaram stand / agendaram | > 60% |
| **Naturalidade do agente** | Leads que percebem que e bot (survey) | < 10% |
| **Uptime do sistema** | Disponibilidade 24/7 | > 99% |

### Metricas secundarias (Fase 2-3 -- a partir de maio/2026)

| Metrica | Como medir | Meta |
|---------|-----------|------|
| **Conversao por campanha** | Fechamentos / leads por campanha | Baseline a definir |
| **Custo por lead qualificado** | Investimento Meta Ads / leads qualificados | Reduzir vs atual |
| **Performance por corretor** | Taxa de fechamento individual | Baseline a definir |
| **Tempo medio de ciclo** | Dias entre primeiro contato e fechamento | Baseline a definir |
| **Satisfacao do corretor** | NPS interno (survey trimestral) | > 7/10 |
| **Leads reativados** | Leads frios que retomaram contato | > 5% da base |
| **ROI do sistema** | Receita incremental / custo total | > 5x |

### Comparativo vs solucoes anteriores

| Comparacao | Lais (positiva) | Zenvia (negativa) | Nicole (meta) |
|-----------|----------------|-------------------|--------------|
| Custo mensal | R$1.400 | R$1.000+ | ~R$500-800 |
| Qualidade atendimento | Boa | Ruim ("bot obvio") | Superior a Lais |
| Qualificacao | Basica | Nao fazia | Avancada (regras de negocio) |
| Envio de materiais | N/A | Nao conseguia | Sim (plantas, renders) |
| CRM integrado | Sim (simples) | Nao | Sim (completo, kanban, analytics) |
| Transbordo | Desestruturado | N/A | Transparente + resumo IA |
| Controle de conversas | Limitado | Nenhum | 100% registrado + supervisao real-time |

---

**Proximo passo:** Este PRD vai para o @po (Pax) que valida os epics, prioriza o backlog, e libera para o @sm (River) criar stories detalhadas. Pipeline: `@pm (concluido) → @po → @sm → @dev → @qa → @devops`.
