# Pesquisa Tecnica: Integracao WhatsApp Business API — Trifold CRM

**Data:** 31/03/2026
**Autor:** Research Agent
**Contexto:** Trifold Engenharia (Maringa-PR) precisa de numero oficial WhatsApp com agente IA (Nicole) + transbordo transparente para corretores + CRM centralizado
**Base:** Documentacao oficial Meta, BSPs, artigos tecnicos 2025-2026

---

## 1. Opcoes de Arquitetura

### Opcao A: Numero Oficial Meta (Cloud API) + Z-API pros Corretores

#### Como funciona
- O numero principal da Trifold e registrado na **WhatsApp Business Platform (Cloud API)** via Meta diretamente ou via BSP
- O agente Nicole roda nesse numero oficial, recebendo e respondendo leads via Cloud API (webhooks + send message API)
- Quando o lead e qualificado, o sistema faz **handoff interno**: o agente para de responder e notifica o corretor
- O corretor atende o lead em um **numero separado da Trifold** (chip corporativo) conectado via **Z-API**
- O CRM monitora ambas as pontas: Cloud API (agente) e Z-API (corretor)

#### Experiencia do lead
- Lead recebe mensagem do numero oficial Trifold (agente Nicole)
- Quando qualificado, recebe algo como: "Vou transferir voce para o Joao, nosso especialista no Yarden"
- Lead passa a conversar em um **numero diferente** (numero corporativo do corretor)
- **O lead PERCEBE a troca de numero** — recebe mensagem de um novo contato

#### Pros
- Numero principal 100% oficial, sem risco de banimento
- Click-to-WhatsApp Ads funciona nativamente
- Cloud API tem SLA de uptime garantido pela Meta
- Selo verificado (tick verde) no numero principal
- Webhooks robustos com dados de referral (campanha, ad_id)
- Monitoramento das conversas dos corretores via Z-API

#### Contras
- **Lead muda de numero** — experiencia fragmentada, perde confianca
- Lead precisa salvar novo contato
- Dois sistemas diferentes para manter (Cloud API + Z-API)
- Corretor usando Z-API tem risco de banimento do numero corporativo
- Complexidade de integracao duplicada

#### Custos estimados
| Item | Custo mensal |
|------|-------------|
| Cloud API (Meta) — mensagens de servico | Gratis (customer-initiated dentro de 24h) |
| Cloud API — templates marketing | ~US$ 0,0625/msg (Brasil) |
| Cloud API — templates utility | ~US$ 0,0068/msg (Brasil) |
| Z-API — instancia por corretor | ~R$ 60-100/mes por numero |
| BSP (se usar) | R$ 0-500/mes dependendo do provider |
| **Total estimado (5 corretores)** | **~R$ 300-600/mes (Z-API) + custos Meta por mensagem** |

---

### Opcao B: Tudo via Z-API (Numero Principal + Instancias dos Corretores)

#### Como funciona
- O numero principal da Trifold e conectado via **Z-API** (API nao oficial)
- O agente Nicole roda nesse numero via Z-API
- Quando o lead e qualificado, o sistema notifica o corretor
- O corretor recebe o lead em **outro numero** tambem conectado via Z-API
- Tudo passa pelo mesmo provider (Z-API), facilitando integracao

#### Experiencia do lead
- Identica a Opcao A: **lead muda de numero** na transferencia
- Ou alternativa: corretor responde pelo mesmo numero via Z-API (mas Z-API nao tem multi-agent nativo robusto)

#### Pros
- Custo mais baixo (sem taxas da Meta por mensagem)
- Setup mais rapido (Z-API ja e familiar, agente-linda ja usa)
- Uma unica API para tudo
- Mais flexibilidade (pode enviar qualquer tipo de mensagem sem templates pre-aprovados)
- Nao precisa de aprovacao de templates pela Meta

#### Contras
- **RISCO CRITICO: Banimento** — Z-API usa conexao nao oficial (WhatsApp Web protocol)
- WhatsApp pode banir o numero a qualquer momento, sem aviso
- Numeros novos conectados a Z-API tem risco altissimo de ban nas primeiras semanas
- Nao suporta Click-to-WhatsApp Ads nativamente (ads apontam para WABA, nao para Z-API)
- Sem selo verificado (tick verde)
- Sem dados de referral das campanhas (campaign_id, ad_id, ctwa_clid)
- Nao tem SLA de uptime
- **Viola Termos de Servico do WhatsApp** — risco juridico e operacional
- Se o numero principal for banido, perdem TODOS os leads em andamento

#### Riscos de banimento (dados reais 2025-2026)
- Numeros novos: banimento pode ocorrer com apenas **10 mensagens** para contatos diferentes
- Z-API recomenda "aquecimento manual" do numero antes de conectar a API
- Em periodos de intensificacao da moderacao do WhatsApp, taxa de banimento sobe independentemente do provider
- **Para uma construtora com lancamento em julho/2026, perder o numero e catastrofico**

#### Custos estimados
| Item | Custo mensal |
|------|-------------|
| Z-API — instancia principal | ~R$ 60-100/mes |
| Z-API — instancias corretores (5x) | ~R$ 300-500/mes |
| Mensagens | Gratis (sem cobranca por mensagem) |
| **Total estimado** | **~R$ 360-600/mes** |

---

### Opcao C: Numero Oficial Meta (Cloud API) pra TUDO — Agente + Corretores no MESMO Numero (RECOMENDADA)

#### Como funciona
- O numero principal da Trifold e registrado na **WhatsApp Business Platform (Cloud API)**
- O agente Nicole atende leads via Cloud API
- Quando o lead e qualificado, o sistema faz **roteamento interno** — a conversa e atribuida ao corretor
- O corretor responde **pelo mesmo numero**, via interface do CRM (shared inbox / painel do corretor)
- O CRM controla quem responde: se e a Nicole ou o corretor
- **O lead NUNCA muda de numero** — tudo acontece no mesmo chat

#### Arquitetura tecnica
```
Lead envia mensagem
        ↓
   Meta Cloud API (webhook)
        ↓
   Trifold CRM Backend
        ↓
   Router decide: Nicole ou Corretor?
        ↓
   ┌──────────┐     ┌──────────────┐
   │  Nicole   │     │   Corretor   │
   │ (agente)  │     │ (via painel) │
   └──────────┘     └──────────────┘
        ↓                    ↓
   Responde via          Responde via
   Cloud API             Cloud API
   (automatico)          (manual, pelo CRM)
        ↓                    ↓
   MESMO NUMERO → Lead recebe tudo no mesmo chat
```

#### Como funciona o multi-agent no mesmo numero
1. **Todos os webhooks chegam no seu backend** — voce controla 100% do roteamento
2. Quando a Nicole esta atendendo, o backend processa a mensagem com a IA e responde via API
3. Quando o corretor assume, o backend **para de enviar para a IA** e mostra a mensagem no painel do corretor
4. O corretor digita a resposta no painel do CRM, e o backend envia via Cloud API
5. **Para o lead, e tudo o mesmo numero, o mesmo chat** — ele nao sabe se e IA ou humano
6. Transferencia de contexto: o corretor ve todo o historico + resumo IA antes de responder

#### Experiencia do lead
- Lead clica no anuncio → abre WhatsApp → numero oficial Trifold (com selo verde)
- Nicole atende, qualifica, agenda
- Quando transferido, a conversa **continua no mesmo chat**
- Lead nao percebe a troca — so nota que o "atendente" agora fala um pouco diferente
- Pode ate ter uma mensagem suave: "Deixa eu chamar o Joao que e especialista no Yarden, ele ja esta aqui comigo"
- **Experiencia completamente fluida e profissional**

#### Pros
- **Lead NUNCA muda de numero** — experiencia perfeita
- 100% oficial, sem risco de banimento
- Click-to-WhatsApp Ads funciona nativamente
- Selo verificado (tick verde)
- Dados completos de referral (campaign_id, ad_id, ctwa_clid)
- Janela de 72h gratuita para leads de CTWA Ads
- Mensagens de servico (customer-initiated) sao **gratuitas**
- Multi-agent e 100% viavel — voce controla o roteamento no seu backend
- Supervisor pode monitorar TODAS as conversas (agente + corretor) em um so lugar
- Supervisor pode intervir a qualquer momento
- Historico completo e unificado
- **Coexistence mode** (desde maio/2025): pode usar WhatsApp Business App + Cloud API no mesmo numero simultaneamente

#### Contras
- Corretor NAO usa WhatsApp no celular — responde pelo painel do CRM
- Se o corretor estiver em campo e sem acesso ao painel, precisa de versao mobile do CRM
- Templates precisam ser pre-aprovados pela Meta (para mensagens fora da janela de 24h)
- Precisa construir a interface de chat no CRM (shared inbox)
- Setup inicial mais complexo (Meta Business verification, WABA registration)

#### Contorno para o corretor em campo
Com o **Coexistence mode** (lancado em maio/2025), e possivel:
- Manter o WhatsApp Business App no celular **e** a Cloud API funcionando no backend
- Mensagens recebidas aparecem em **ambos** (App + API)
- Corretor pode responder pelo App no celular quando em campo
- Mensagens enviadas pelo App sao **gratuitas** e aparecem no backend via Messaging Echoes
- **Requisito:** WhatsApp Business App versao 2.24.17+
- **Limitacao:** Throughput fixado em 20 msg/s para numeros em coexistence

#### Custos estimados
| Item | Custo mensal |
|------|-------------|
| Cloud API (Meta) — mensagens de servico | **Gratis** (customer-initiated) |
| Cloud API — janela 72h (leads de CTWA Ads) | **Gratis** |
| Cloud API — templates marketing (reativacao base fria) | ~US$ 0,0625/msg = ~R$ 0,35/msg |
| Cloud API — templates utility (confirmacao visita, lembrete) | ~US$ 0,0068/msg = ~R$ 0,04/msg |
| BSP (se usar, ex: 360dialog) | R$ 0-200/mes |
| Meta diretamente (sem BSP) | R$ 0 (sem mensalidade) |
| **Total estimado (operacao normal)** | **~R$ 0-200/mes + custos por template enviado** |

**Nota sobre custos:** Para o uso principal da Trifold (leads entrando via CTWA Ads e sendo atendidos), o custo de mensagens e praticamente **ZERO**, porque:
- Lead inicia a conversa → janela de 72h gratuita (CTWA Ads)
- Dentro dessa janela, todas as mensagens (agente + corretor) sao gratuitas
- So paga por templates se precisar recontatar o lead DEPOIS da janela fechar

---

### Opcao D: Hibrido (Cloud API pro Agente, Z-API pros Corretores, Lead NAO Muda de Numero)

#### Viabilidade tecnica
**NAO E VIAVEL** da forma descrita. Motivos:

1. Um numero WhatsApp so pode estar conectado a **uma** plataforma por vez (Cloud API OU Z-API, nao ambos controlando o mesmo numero)
2. O Coexistence mode permite Cloud API + WhatsApp Business App, mas NAO Cloud API + Z-API
3. Z-API usa o protocolo do WhatsApp Web/App — se a Cloud API esta controlando o numero, Z-API nao consegue conectar

#### Alternativa que funciona
A unica forma de ter "hibrido sem o lead mudar de numero" e a **Opcao C** — tudo pela Cloud API, com corretores respondendo via painel do CRM. O Coexistence mode permite que corretores usem o WhatsApp Business App no celular como fallback.

---

## 2. Click to WhatsApp Ads (CTWA)

### Como configurar
1. **Pre-requisitos:**
   - Facebook Business Page vinculada ao WhatsApp Business Account (WABA)
   - Numero registrado na Cloud API (ou BSP)
   - Meta Business Manager configurado

2. **No Meta Ads Manager:**
   - Criar campanha com objetivo: **Traffic**, **Engagement** ou **Sales**
   - Em "Conversion details": selecionar **Messaging app**
   - Em "Ad type": selecionar **Click to message**
   - Selecionar a Facebook Page
   - Selecionar **WhatsApp** como destino
   - Configurar o criativo normalmente (imagem, video, carousel)

3. **Mensagem de boas-vindas:**
   - Pode configurar uma mensagem pre-preenchida que aparece quando o lead abre o chat
   - Pode configurar botoes de resposta rapida (ex: "Quero saber sobre o Yarden")

### O que acontece quando o lead clica
1. Lead ve o anuncio no Facebook/Instagram
2. Clica no botao "Enviar mensagem"
3. WhatsApp abre diretamente no numero oficial da Trifold
4. Mensagem pre-preenchida aparece (configuravel)
5. Lead envia a primeira mensagem
6. **Webhook chega no backend** com dados do referral

### Dados que chegam no webhook (referral object)
```json
{
  "messages": [{
    "from": "5544999999999",
    "type": "text",
    "text": { "body": "Quero saber sobre o Yarden" },
    "referral": {
      "source_url": "https://fb.me/...",
      "source_id": "120208XXXXXX",
      "source_type": "ad",
      "headline": "Yarden - Alto Padrao em Maringa",
      "body": "Apartamentos com rooftop exclusivo...",
      "media_type": "image",
      "image_url": "https://...",
      "ctwa_clid": "AbCdEfGhIjKlMnOpQrStUv..."
    }
  }]
}
```

### Campos de rastreamento
| Campo | Descricao | Uso no CRM |
|-------|-----------|------------|
| `source_id` | ID do anuncio/campanha Meta | Vincular lead a campanha |
| `source_type` | Sempre "ad" para CTWA | Identificar origem |
| `ctwa_clid` | Click ID unico da conversa | **Essencial** para Conversions API (enviar eventos de conversao de volta pro Meta) |
| `headline` | Titulo do anuncio | Contexto do que o lead viu |
| `body` | Texto do anuncio | Contexto do que o lead viu |
| `image_url` | Imagem do anuncio | Referencia visual |

### Como rastrear origem completa
1. **No webhook:** Capturar o `referral` object completo na primeira mensagem
2. **No CRM:** Salvar `source_id`, `ctwa_clid`, e demais campos na ficha do lead
3. **Conversions API:** Quando o lead agenda visita, visita, ou fecha, enviar evento de volta pro Meta usando o `ctwa_clid`
4. **Meta Ads Manager:** Metricas de conversao aparecem automaticamente (ROI por campanha)

### Janela especial de 72h para CTWA
- Quando um lead inicia conversa via Click-to-WhatsApp Ad, a janela de messaging gratuito e de **72 horas** (nao 24h como normal)
- Dentro dessas 72h, pode enviar qualquer mensagem (inclusive marketing templates) **sem custo**
- Isso e extremamente vantajoso para o fluxo: agente qualifica (dia 1) → corretor assume (dia 1-2) → follow-up (dia 2-3) — tudo gratis

---

## 3. WhatsApp Business API — Detalhes Tecnicos

### Cloud API vs On-Premise API

| Aspecto | Cloud API | On-Premise API |
|---------|-----------|---------------|
| **Hosting** | Meta hospeda | Voce hospeda |
| **Setup** | Minutos (via Meta Business Manager) | Semanas (Docker, servidores) |
| **Manutencao** | Meta cuida | Voce cuida |
| **Custo infra** | Zero | Servidores proprios |
| **Throughput** | Ate 500 msg/s (padrao 80 msg/s) | Depende do seu hardware |
| **Disponibilidade** | SLA Meta | Depende de voce |
| **Status 2026** | **Recomendado** — unico caminho oficial | **Descontinuado em outubro/2025** |

**Veredicto:** Cloud API e a unica opcao viavel em 2026. On-Premise foi descontinuado.

### BSPs (Business Solution Providers) no Brasil

| BSP | Tipo | Custo mensal | Diferenciais | Ideal para |
|-----|------|-------------|-------------|------------|
| **Direto pela Meta** | Sem intermediario | R$ 0 + custos por msg | Sem markup, controle total | Devs com experiencia em API |
| **360dialog** | BSP global | ~R$ 0-200/mes | Sem markup nas mensagens, acesso direto a API | Startups/devs que querem API crua |
| **Blip** | BSP brasileiro | R$ 500-2.000+/mes | Plataforma completa, chatbot builder | Empresas sem dev team |
| **Twilio** | BSP global | ~US$ 0,005/msg + custos Meta | API robusta, docs excelentes | Devs, integracao complexa |
| **Gupshup** | BSP global | Variavel | Forte em LATAM | Empresas com alto volume |
| **Zenvia** | BSP brasileiro | R$ 500+/mes | Multicanal | Empresas brasileiras mid-market |
| **OmniChat** | BSP brasileiro | Variavel | Foco em e-commerce + WhatsApp | Varejo |

**Para a Trifold (que tem dev — Gabriel):** Acesso direto pela Meta ou via 360dialog (sem markup) e o mais custo-efetivo. Nao precisa pagar por plataforma de BSP cara porque o CRM proprio ja faz o trabalho.

### Webhook Events Disponiveis

| Evento | Descricao | Uso no Trifold CRM |
|--------|-----------|-------------------|
| `messages` | Nova mensagem recebida do lead | Processar com Nicole ou rotear pro corretor |
| `messages.referral` | Dados do anuncio (CTWA) | Rastrear origem do lead |
| `statuses.sent` | Mensagem enviada com sucesso | Confirmar envio |
| `statuses.delivered` | Mensagem entregue ao dispositivo | Tracking de entrega |
| `statuses.read` | Mensagem lida pelo lead | Tracking de leitura |
| `statuses.failed` | Falha no envio | Alertar sistema, retry |
| `messages.interactive` | Resposta a botoes/listas | Processar escolhas do lead |
| `messages.image/document/audio` | Midia recebida | Processar documentos do lead |
| `errors` | Erros fora de banda | Monitoramento e alertas |

### Rate Limits (2026)

| Nivel | Throughput | Condicao |
|-------|-----------|---------|
| Padrao | ~80 msg/s | Conta normal |
| Coexistence | 20 msg/s | Numero com App + API |
| Upgraded | Ate 500 msg/s | Conta com bom historico |
| Unlimited tier | Ate 1.000 msg/s | Volume alto + qualidade |

**Volume diario (Messaging Limits):**

| Tier | Limite (por Business Portfolio) |
|------|-------------------------------|
| Inicial (nao verificado) | 250 conversas/24h |
| Tier 1 (verificado) | 2.000 conversas/24h |
| Tier 2 | 10.000 conversas/24h |
| Tier 3 | 100.000 conversas/24h |
| Ilimitado | Sem limite |

**Nota:** Desde outubro/2025, limites sao por **Business Portfolio**, nao por numero. Upgrade de tier e avaliado a cada **6 horas** (antes era 24-48h).

**Para a Trifold:** Com volume de ~50-200 leads/mes, Tier 1 (2.000/24h) e mais que suficiente. Atingem Tier 1 apos verificacao do business.

### Template Messages vs Session Messages

| Aspecto | Template Messages | Session Messages |
|---------|------------------|-----------------|
| **Quando usar** | Fora da janela de 24h | Dentro da janela de 24h |
| **Aprovacao** | Pre-aprovadas pela Meta | Sem aprovacao necessaria |
| **Formato** | Estruturado (texto + botoes + midia) | Livre (qualquer formato) |
| **Custo** | Pago (varia por categoria) | **Gratis** |
| **Exemplos** | "Ola {{nome}}, sua visita ao Yarden esta confirmada para amanha as 10h" | "Claro! O Yarden fica na Av. Brasil, zona 1" |
| **Categorias** | Marketing, Utility, Authentication | Service |

### Janela de 24h — Regras

1. **Customer-initiated:** Lead envia mensagem → janela de 24h abre → pode enviar qualquer mensagem gratis
2. **Cada resposta do lead reinicia** o timer de 24h
3. **Click-to-WhatsApp Ads:** Janela estendida para **72h** (gratis)
4. **Fora da janela:** So pode enviar template message (pre-aprovado e pago)
5. **Reativacao de lead frio:** Obrigatoriamente via template message (pago)

### Custos por Mensagem (Brasil — 2026)

**Modelo vigente desde 01/07/2025:** Cobranca por **mensagem entregue** (nao mais por conversa de 24h).

| Categoria | Custo por mensagem (USD) | Custo aprox (BRL) | Desconto por volume |
|-----------|------------------------|-------------------|-------------------|
| **Marketing** | US$ 0,0625 | ~R$ 0,35 | Nao tem |
| **Utility** (1-1.000 msgs) | US$ 0,0068 | ~R$ 0,04 | Sim |
| **Utility** (1.001-10.000) | US$ 0,0065 | ~R$ 0,037 | Sim |
| **Authentication** | US$ 0,0068 | ~R$ 0,04 | Sim |
| **Service** (customer-initiated) | **Gratis** | **R$ 0** | N/A |

**Simulacao de custo mensal para a Trifold:**

| Cenario | Qtd | Tipo | Custo |
|---------|-----|------|-------|
| Leads de CTWA Ads (atendimento) | 200/mes | Service (72h gratis) | **R$ 0** |
| Confirmacao de visita (template) | 100/mes | Utility | ~R$ 4 |
| Lembrete de visita (template) | 100/mes | Utility | ~R$ 4 |
| Reativacao base fria (template) | 500/mes | Marketing | ~R$ 175 |
| **Total estimado** | | | **~R$ 183/mes** |

**Comparacao com o que pagavam:**
- Lais: R$ 1.400/mes
- Zenvia: R$ 1.000+/mes
- **Cloud API direto: ~R$ 183/mes** (so mensagens) + R$ 0-200 BSP = **~R$ 183-383/mes**

---

## 4. Recomendacao para a Trifold

### Recomendacao: OPCAO C — Cloud API para TUDO (agente + corretores no mesmo numero)

#### Por que esta e a melhor opcao

**1. Lead NUNCA muda de numero**
- Requisito explicito do projeto: "transbordo e transparente — cliente nao sabe que mudou de atendente"
- Na Opcao C, o lead ve um unico numero durante toda a jornada
- Confianca e profissionalismo — essencial para venda de alto padrao (Yarden)

**2. Zero risco de banimento**
- A Trifold tem lancamento do Yarden em julho/2026 — NAO pode arriscar perder o numero
- Cloud API e 100% oficial, com SLA da Meta
- Z-API (Opcoes A/B) viola ToS do WhatsApp = risco inaceitavel para operacao critica

**3. Click-to-WhatsApp Ads funciona nativamente**
- Leads de Meta Ads caem direto no numero oficial
- Dados de referral (campaign_id, ctwa_clid) chegam no webhook
- Janela de 72h gratuita para leads de anuncio
- Conversions API para otimizar campanhas (enviar eventos de volta ao Meta)

**4. Custo dramaticamente menor**
- Operacao normal: ~R$ 183/mes em mensagens (vs R$ 1.400 Lais ou R$ 1.000+ Zenvia)
- Sem mensalidade de plataforma se usar Cloud API direto pela Meta
- Mensagens de servico (atendimento ao lead) sao GRATUITAS

**5. Centralizado no CRM**
- Todas as conversas (agente + corretor) ficam no CRM Trifold
- Supervisor monitora tudo em tempo real
- Historico completo e unificado
- Nao depende de plataforma terceira (Blip, Zenvia, etc.)

**6. Coexistence mode como fallback**
- Corretor pode responder pelo WhatsApp Business App no celular quando em campo
- Mensagens aparecem em ambos (App + CRM via API)
- Sem custo adicional

#### O que a Trifold ja tem que facilita
- Numero oficial Meta ja cadastrado
- Meta Ads ja rodando (investimento em trafego pago)
- Gabriel tem experiencia com integracao WhatsApp (agente-linda)
- CRM proprio sendo construido (controle total sobre roteamento)

#### Limitacoes a gerenciar
1. **Corretor precisa de interface de chat no CRM** — precisa construir o painel do corretor com inbox
2. **Templates precisam ser aprovados pela Meta** — submeter templates de utility/marketing antecipadamente
3. **Verificacao do Business** — WABA precisa ser verificado (processo de 1-5 dias)
4. **Coexistence tem throughput limitado (20 msg/s)** — irrelevante para o volume da Trifold

---

## 5. Implicacoes pro Projeto

### 5.1 O que muda no agente-linda

| Componente | Antes (Z-API) | Depois (Cloud API) |
|-----------|--------------|-------------------|
| **Provider de mensagens** | `z-api-client.ts` | Novo: `cloud-api-client.ts` |
| **Webhook handler** | Formato Z-API | Formato Meta Cloud API |
| **Envio de mensagens** | Z-API endpoints | `graph.facebook.com/v21.0/{phone_id}/messages` |
| **Envio de midia** | Z-API upload | Cloud API media upload + ID |
| **Referral data** | Nao existe | `message.referral` object |
| **Status tracking** | Limitado | Read receipts, delivery status |
| **Template messages** | Nao necessario | Necessario para fora da janela de 24h |
| **Autenticacao** | Token Z-API | Facebook App credentials + System User Token |

**Estimativa de esforco:** 3-5 dias para migrar o provider de Z-API para Cloud API.

### 5.2 O que muda no schema do banco

Novas tabelas/campos necessarios:

```sql
-- Dados de referral do CTWA
ALTER TABLE leads ADD COLUMN meta_source_id TEXT;        -- ID do anuncio
ALTER TABLE leads ADD COLUMN meta_source_type TEXT;       -- "ad"
ALTER TABLE leads ADD COLUMN meta_ctwa_clid TEXT;         -- Click ID para Conversions API
ALTER TABLE leads ADD COLUMN meta_ad_headline TEXT;       -- Titulo do anuncio
ALTER TABLE leads ADD COLUMN meta_ad_body TEXT;           -- Texto do anuncio
ALTER TABLE leads ADD COLUMN meta_referral_raw JSONB;     -- Payload completo

-- Template tracking
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,             -- ex: "visit_confirmation"
  category TEXT NOT NULL,         -- marketing, utility, authentication
  status TEXT NOT NULL,           -- approved, pending, rejected
  language TEXT DEFAULT 'pt_BR',
  components JSONB,              -- estrutura do template
  meta_template_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message status tracking (read receipts)
ALTER TABLE messages ADD COLUMN wa_message_id TEXT;       -- ID da mensagem na Cloud API
ALTER TABLE messages ADD COLUMN delivered_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;

-- Conversions tracking
CREATE TABLE meta_conversion_events (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  ctwa_clid TEXT NOT NULL,
  event_name TEXT NOT NULL,       -- "lead_qualified", "visit_scheduled", "visited", "closed"
  event_time TIMESTAMPTZ DEFAULT NOW(),
  sent_to_meta BOOLEAN DEFAULT FALSE,
  meta_response JSONB
);
```

### 5.3 O que muda no bot / CRM

#### Novo modulo: Cloud API Provider
- Client para envio de mensagens via `graph.facebook.com`
- Handler de webhooks no formato Meta (verificacao de signature, parsing)
- Upload e gerenciamento de midia
- Gerenciamento de templates (criar, submeter, consultar status)

#### Novo modulo: Shared Inbox (Painel do Corretor)
- Interface de chat real-time para o corretor responder leads
- Indicador de quem esta respondendo (Nicole ou corretor)
- Botao "assumir conversa" / "devolver para Nicole"
- Notificacao push quando novo lead e designado
- Historico + resumo IA visivel antes de responder

#### Novo modulo: Conversions API
- Enviar eventos de conversao de volta para o Meta (via `ctwa_clid`)
- Eventos: lead_qualified, visit_scheduled, visited, deal_closed
- Permite que Meta Ads otimize campanhas com base em conversoes reais

#### Novo modulo: Template Manager
- CRUD de templates no painel admin
- Submissao para aprovacao da Meta via API
- Status tracking (approved/pending/rejected)
- Preview do template antes de enviar

### 5.4 Timeline de Implementacao

| Fase | Tarefa | Duracao | Dependencia |
|------|--------|---------|-------------|
| **0** | Verificacao do WABA + registro do numero na Cloud API | 1-5 dias | Meta Business Manager |
| **0** | Submissao de templates iniciais (confirmacao visita, lembrete, reativacao) | 1-3 dias | WABA verificado |
| **1** | Implementar `cloud-api-client.ts` (envio de mensagens) | 2-3 dias | WABA registrado |
| **1** | Implementar webhook handler (formato Meta) | 1-2 dias | - |
| **1** | Captura de referral data (CTWA) | 1 dia | Webhook handler |
| **1** | Migrar Nicole de Z-API para Cloud API | 1-2 dias | Client + webhook |
| **2** | Roteamento de conversa (Nicole ↔ Corretor) | 2-3 dias | Nicole rodando |
| **2** | Shared inbox / painel do corretor | 3-5 dias | Roteamento |
| **2** | Template manager (admin) | 2-3 dias | - |
| **3** | Conversions API (enviar eventos pro Meta) | 2-3 dias | Referral data |
| **3** | Coexistence mode (corretor via App) | 1-2 dias | Cloud API rodando |
| **Total** | | **~3-5 semanas** | |

**Nota:** Muitas tarefas podem ser paralelizadas. A timeline e conservadora.

---

## Apendice: Glossario Tecnico

| Termo | Significado |
|-------|------------|
| **WABA** | WhatsApp Business Account — conta oficial na plataforma Meta |
| **Cloud API** | API hospedada pela Meta para envio/recebimento de mensagens |
| **BSP** | Business Solution Provider — intermediario autorizado pela Meta |
| **CTWA** | Click-to-WhatsApp — tipo de anuncio que abre conversa no WhatsApp |
| **ctwa_clid** | Click ID unico para atribuicao de conversao |
| **Coexistence** | Modo que permite usar App + Cloud API no mesmo numero |
| **Template message** | Mensagem pre-aprovada pela Meta (para uso fora da janela de 24h) |
| **Session message** | Mensagem livre dentro da janela de 24h (gratuita) |
| **Referral** | Dados do anuncio que chegam quando lead vem de CTWA |
| **Messaging Echoes** | Sincronizacao de mensagens entre App e API no modo Coexistence |
| **Conversions API** | API da Meta para enviar eventos de conversao (otimizar ads) |

---

## Fontes

- [WhatsApp Business Platform Pricing](https://business.whatsapp.com/products/platform-pricing)
- [WhatsApp Cloud API Get Started — Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
- [Pricing on the WhatsApp Business Platform — Meta for Developers](https://developers.facebook.com/docs/whatsapp/pricing)
- [Click to WhatsApp — Marketing API — Meta for Developers](https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-whatsapp/)
- [Messages Webhook Reference — Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/)
- [Webhooks Setup — WhatsApp Cloud API — Meta for Developers](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- [Ads that Click to WhatsApp — WhatsApp Business](https://business.whatsapp.com/products/ads-that-click-to-whatsapp)
- [WhatsApp Multi-Agent: Multiple Agents Guide 2026 — GuruSup](https://gurusup.com/blog/whatsapp-multi-agent)
- [How to Use WhatsApp with Multiple Agents on the Same Number — Aurora Inbox](https://www.aurorainbox.com/en/2026/02/23/whatsapp-multiple-agents-same-number/)
- [WhatsApp Business Multiple Users: Manage Your Team at Scale — respond.io](https://respond.io/whatsapp-business-multiple-users)
- [WhatsApp Coexistence: Business and API with the Same Number — Sanuker](https://sanuker.com/whatsapp-coexistence-business-api/)
- [WhatsApp Coexistence — Business App and API — SleekFlow](https://sleekflow.io/blog/whatsapp-coexistence)
- [WhatsApp Business App + API Coexistence Pricing — ChatMaxima](https://chatmaxima.com/blog/whatsapp-business-app-api-coexistence-pricing-scenarios-2026/)
- [API Oficial do WhatsApp vs APIs Nao Oficiais — Z-PRO](https://ajuda.zdg.com.br/conheca-o-z-pro/recursos-e-integracoes-do-z-pro/api-oficial-do-whatsapp-vs.-apis-nao-oficiais)
- [Z-API vs API Oficial — Z-API Docs](https://developer.z-api.io/en/tips/Z-APIvsAPI-OFICIAL)
- [API Oficial WhatsApp vs Nao Oficial: Guia Completo 2026 — Agencia Rollin](https://www.agenciarollin.com/blog/api-oficial-whatsapp-vs-nao-oficial-guia-completo-2026)
- [Blocks and Bans 2025 — Z-API Docs](https://developer.z-api.io/en/tips/blockednumbernew)
- [WhatsApp Messaging Limits 2026 — Chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits)
- [Scale WhatsApp Cloud API: Throughput Limits 2026 — WuSeller](https://www.wuseller.com/whatsapp-business-knowledge-hub/scale-whatsapp-cloud-api-master-throughput-limits-upgrades-2026/)
- [Top 20 Provedores WhatsApp Business API no Brasil 2026 — AiSensy](https://m.aisensy.com/blog/top-provedores-whatsapp-business-api-brasil/)
- [WhatsApp API Pricing 2026: Costs, Categories & Cost Hacks — Chatarmin](https://chatarmin.com/en/blog/whats-app-api-pricing)
- [WhatsApp Pricing Update 2026 — Authkey](https://authkey.io/blogs/whatsapp-pricing-update-2026/)
- [2026 Guide to Create Ads that Click to WhatsApp — Twilio](https://www.twilio.com/en-us/blog/products/2026-guide-to-create-ads-that-click-to-whatsapp-with-twilio)
- [Meta Conversions API for Click to WhatsApp Ads — InsiderOne](https://academy.insiderone.com/docs/meta-conversions-api-for-click-to-whatsapp-ads)
- [Implementing Webhooks From The WhatsApp Business Platform — WhatsApp Business](https://business.whatsapp.com/blog/how-to-use-webhooks-from-whatsapp-business-api)
