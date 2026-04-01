# Extracao Estruturada — Reuniao Trifold 31/03/2026

**Agente:** @dx-interviewer (Lyra) — DX Squad / Reche Inc.
**Fonte:** Transcricao presencial, escritorio Trifold Engenharia, Maringa-PR
**Participantes identificados:** Alexandre (socio), Lucas/Marcao (comercial/operacional), Sergio (presente, pouco vocal), Gabriel (Reche Inc)
**Tipo de reuniao:** Definicao de projeto — escopo, modelo comercial, proximos passos

---

## 1. Dados Quantitativos

| Dado | Quem falou | Confianca | Observacao |
|------|-----------|-----------|------------|
| 3 empreendimentos ativos (2 em comercializacao + 1 lancamento este ano) | Alexandre/Lucas | Firme | "Hoje a gente ta com 3 produtos so. 2, na verdade. Mas o terceiro vai ser esse ano." |
| 200 unidades no Yarden (confirmado da reuniao anterior) | Contexto | Firme | Referenciado no fluxo de pagamento |
| R$1.400/mes pagos para a Lais (chatbot anterior) | Lucas/Marcao | Firme | "1400 reais, cara, um espetaculo pra funcionar porque ele e besta" — consideravam barato e eficaz |
| R$1.000+ pagos para Zenvia (bot atual) | Lucas/Alexandre | Estimativa | "1000 e como custou mais? Por mes" — valor aproximado mencionado |
| 3 meses pagando Zenvia sem resultado | Alexandre/Lucas | Firme | "Voces estao 3 meses ja pagando?" — confirmado |
| 4-5 horas/semana de disponibilidade da equipe Trifold | Lucas/Marcao | Firme | "4, 5 horas por semana?" — compromisso de dedicacao ao projeto |
| Proximo encontro: sexta-feira (04/04) as 14h-15h | Gabriel/Alexandre | Firme | "Sexta eu volto aqui" + "Duas, tres horas?" |
| Telefone de contato: 44 9 9968-9446 | Gabriel | Firme | Numero passado para criar grupo |

---

## 2. Decisoes Tomadas (ACORDOS)

| Decisao | Quem decidiu | Contexto |
|---------|-------------|----------|
| **Usar a base do agente-linda como ponto de partida** | Gabriel + Alexandre | "Eu vou passar a base do meu pra voces e dai a gente toca. Porque dai gente ganha tempo. Ja tem embalagem" — consenso de nao desenvolver do zero |
| **Modelo de trabalho: consultoria + desenvolvimento conjunto** | Gabriel + Alexandre | Gabriel passa a base, ensina Claude Code + agentes, vem presencialmente para direcionar. Equipe Trifold (Lucas/Marcao) toca o dia-a-dia |
| **MVP foca PRIMEIRO no conversacional (agente WhatsApp)** | Alexandre (decisor) | "Nesse caso, gente precisa do conversacional, nosso foco aqui" + "Primeiro e o conversacional" |
| **Agente inicia no numero oficial, transbordo para corretor via numero Trifold** | Gabriel (proposta) + Alexandre (aceite) | Corretor usa numero da empresa (nao pessoal) para manter controle das conversas |
| **CRM proprio em vez de integrar com Supremo** | Consenso | "No seu caso, como voce ja tem o basico, talvez faca mais sentido... Comeca a tua base e a vai evoluindo" — Supremo nao sera integrado no MVP |
| **Gabriel apresenta prototipo na sexta (04/04)** | Gabriel | "Sexta eu volto aqui, ja com a base pronta" |
| **Valores e modelo comercial ficaram para sexta** | Gabriel + Alexandre | "Questao de valores e tudo mais depois eu... sexta-feira a gente ve" |
| **Grupo WhatsApp criado para comunicacao** | Gabriel + equipe | Grupo criado na hora da reuniao |

---

## 3. Escopo do Projeto Definido

### 3.1 MVP (Prioridade Imediata)

| Feature | Descricao | Status |
|---------|-----------|--------|
| **Agente conversacional WhatsApp** | Bot inteligente no numero oficial, qualifica leads, responde FAQ dos empreendimentos, agenda visitas | CORE — prioridade #1 |
| **Handoff para corretor** | Transbordo transparente (cliente nao percebe), corretor continua no numero Trifold | CORE |
| **Supervisao em tempo real** | Supervisor acompanha conversas, pode intervir, enviar instrucoes ao corretor via IA | CORE |
| **Base de conhecimento dos empreendimentos** | Cadastro de info dos predios, unidades, FAQ, diferenciais | CORE |
| **Painel administrativo basico** | Treinamento da IA, gestao de base de conhecimento | CORE |

### 3.2 Fase Seguinte (Pos-MVP)

| Feature | Descricao | Status |
|---------|-----------|--------|
| **Rastreamento de origem (tracking)** | Saber de qual anuncio/campanha/criativo veio cada lead | Alexandre: "Pra mim e muito importante" |
| **Dashboard de metricas** | Lead qualificado vs nao, visitas agendadas, conversao por campanha | Alexandre: "essencial" |
| **Follow-up pos-visita** | Agente envia mensagem ao corretor pedindo feedback apos reuniao | Gabriel propos modelo |
| **Pipeline/funil de vendas** | Etapas do funil com movimentacao de leads | Mencionado como evolucao |
| **Nutricao de leads frios** | Reativar base de leads parados (1000+ leads) | Mencionado na reuniao anterior |
| **Geracao de criativos integrada** | Usando plataforma Reche Studio para criar conteudo visual | Gabriel demonstrou, interesse alto |

---

## 4. Modelo Comercial Acordado

### O que foi DEFINIDO:
- **Modelo:** Consultoria + desenvolvimento conjunto (nao e escopo fixo nem hora pura)
- Gabriel entrega a **base do agente-linda** como ponto de partida
- Gabriel ensina **Claude Code + agentes** para equipe Trifold
- Gabriel vem **presencialmente** para direcionar, tirar duvidas, dar direcionamentos
- Equipe Trifold (Lucas/Marcao) dedica **4-5h/semana** para desenvolvimento

### O que ficou PENDENTE para sexta (04/04):
- **Valor da base** (licenca do agente-linda adaptado)
- **Valor da hora** de consultoria do Gabriel
- **Possibilidade de comissao/equity** — Gabriel mencionou: "desenvolvo em conjunto e dai ganho uma comissao ou alguma coisa assim"
- **Mensalidade** (se houver) — nao definida

### Referencia de custos atuais da Trifold:
- Pagavam R$1.400/mes na Lais (e estavam satisfeitos)
- Pagam ~R$1.000+/mes na Zenvia (insatisfeitos, 3 meses sem resultado)
- Ja investiram em ao menos 4 tentativas de chatbot

---

## 5. Fluxo de Atendimento Definido na Reuniao

```
Lead ve anuncio (Meta Ads)
       ↓
Entra em contato via WhatsApp (numero oficial Trifold)
       ↓
Agente IA responde:
  - Simpatica, boa praca
  - Responde FAQ (localizacao, conceito, diferenciais)
  - Qualifica lead (tem entrada? interesse real?)
  - NÃO passa informacoes tecnicas (memoriais descritivos)
  - NÃO faz simulacao financeira detalhada
  - NÃO promete materiais/acabamentos especificos
       ↓
Lead qualificado? → Transbordo para corretor (numero Trifold, nao pessoal)
Lead nao qualificado? → Registra no pipeline, nutre depois
       ↓
Corretor continua atendimento (supervisor monitora)
  - Supervisor pode intervir
  - Supervisor pode enviar instrucoes via IA ao corretor
       ↓
Corretor agenda visita ao stand de vendas
       ↓
[FUTURO] Follow-up pos-visita:
  - Agente pergunta ao corretor como foi
  - Corretor grava audio → IA transcreve → alimenta sistema
```

---

## 6. Restricoes e Regras de Negocio Criticas

| Regra | Motivo | Quem definiu |
|-------|--------|-------------|
| **IA NAO pode prometer materiais/acabamentos especificos** | Memorial descritivo pode mudar durante obra; risco juridico | Lucas/Alexandre |
| **IA NAO pode fazer simulacao financeira detalhada** | Depende do perfil do cliente (renda, entrada); corretor e especialista | Lucas |
| **Quanto mais informacao o lead tem, MENOS ele agenda visita** | Dado historico da Trifold — lead informado demais nao vem ao stand | Lucas/Marcao |
| **O fechamento so acontece presencialmente** | "Indice de fechamento so acontece aqui dentro" — natureza do mercado imobiliario | Lucas |
| **Sem entrada = nao qualifica (Yarden)** | Diretriz comercial — lead sem entrada nao pode ir pro corretor no Yarden | Alexandre |
| **Formas de pagamento: pode falar o padrao (entrada + parcelas)** | Nao simular valores especificos, mas pode informar modelo geral | Lucas |
| **Conversas devem ficar registradas (controle total)** | Alexandre: "Eu tenho que ter controle sobre isso" | Alexandre |
| **Corretor usa numero da Trifold, nao pessoal** | Se corretor sair, dados ficam na empresa | Gabriel/Alexandre |

---

## 7. Base de Conhecimento — O que Trifold vai Entregar

| Material | Responsavel | Status |
|----------|------------|--------|
| Padroes de perguntas e respostas de atendimento | Lucas/Marcao | Pendente — vao compilar |
| Memorial descritivo (tecnico — sera filtrado) | Lucas | Pendente — Gabriel filtra antes de passar pra IA |
| Etapas do funil do CRM Supremo (print) | Lucas/Marcao | Pendente — vao tirar print |
| Informacoes dos empreendimentos (Vinci e Yarden) | Lucas/equipe | Pendente |
| Plantas dos empreendimentos (arquivos) | Equipe | Pendente — para agente enviar ao lead |
| Arquivo Excel/Google com info por empreendimento | Lucas | Pendente |
| Historico de conversas (para treinamento) | Lucas/Marcao | Parcialmente disponivel |

---

## 8. Problemas com Solucoes Anteriores (Detalhado)

### Zenvia (atual — R$1.000+/mes, 3 meses)
- Bot obvio ("E bem obvio que e um bot")
- Sem formatacao nas mensagens
- Nao consegue enviar arquivos (plantas)
- Nao qualifica leads adequadamente
- Nao entende o mercado imobiliario
- Travava no modo de conversar
- Baseado em fluxos pre-definidos, nao IA conversacional

### Lais (anterior — R$1.400/mes)
- **Gostavam bastante** — "um espetaculo pra funcionar porque ele e besta"
- Fazia somente o que tinha que fazer (simples e eficaz)
- Tinha CRM integrado
- Removida por orientacao de consultoria ("achavam caro")
- Problema: nao tinha integracao com CRM Supremo, na hora de transbordar "transbordava tudo"
- Custo de trocar CRM + retreinar corretores inviabilizou continuidade

### Tentativas anteriores (4+ no total)
- Todas falharam por nao entender o mercado imobiliario
- "Esses caras nasceram no mercado do milhao... varejo, ecommerce, e muito diferente"
- Mercado imobiliario tem ciclo longo, cliente precisa ir presencialmente, peculiaridades unicas

---

## 9. Responsabilidades

| Quem | Faz o que | Quando |
|------|-----------|--------|
| **Gabriel** | Adapta base do agente-linda para Trifold, treina IA com materiais recebidos | Ate sexta (04/04) |
| **Gabriel** | Apresenta prototipo funcional na sexta | 04/04 as 14h-15h |
| **Gabriel** | Define valores (base + hora) para apresentar na sexta | Ate 04/04 |
| **Gabriel** | Ensina Claude Code + agentes para equipe | A partir de sexta |
| **Lucas/Marcao** | Compila base de conhecimento (FAQ, empreendimentos, funil) | Ate sexta |
| **Lucas/Marcao** | Envia prints das etapas do funil do Supremo | Ate sexta |
| **Lucas/Marcao** | Dedica 4-5h/semana ao desenvolvimento do projeto | Continuo |
| **Alexandre** | Aprova valores e modelo comercial | Sexta (04/04) |

---

## 10. Pendencias e Proximos Passos

| Pendencia | Responsavel | Prazo |
|-----------|------------|-------|
| Trifold enviar base de conhecimento (FAQ, empreendimentos) | Lucas/Marcao | Ate 04/04 |
| Trifold enviar etapas do funil (print do Supremo) | Lucas/Marcao | Ate 04/04 |
| Trifold enviar plantas dos empreendimentos | Equipe | Ate 04/04 |
| Trifold enviar memorial descritivo (Gabriel filtra) | Lucas | Ate 04/04 |
| Gabriel adaptar agente-linda para Trifold | Gabriel | Ate 04/04 |
| Gabriel preparar proposta comercial (valores) | Gabriel | Ate 04/04 |
| Reuniao de apresentacao + refinamento | Todos | 04/04 14h-15h |
| Definicao de modelo comercial final | Gabriel + Alexandre | 04/04 |
| Inicio do treinamento Claude Code + agentes | Gabriel + Lucas/Marcao | Pos 04/04 |

---

## 11. Preocupacoes e Objecoes Levantadas

| Preocupacao | Quem | Severidade | Como foi tratada |
|------------|------|-----------|-----------------|
| **IA pode expor informacoes tecnicas sensiveis** | Lucas | ALTA | Gabriel vai filtrar memorial descritivo antes de passar pra IA; regras de guardrail |
| **Corretor perde controle se usar WhatsApp pessoal** | Alexandre | ALTA | Resolvido: corretor usa numero Trifold, empresa mantem controle |
| **Lead com muita info nao agenda visita** | Lucas/Marcao | ALTA | IA sera treinada para ser estrategica — informar o suficiente para despertar interesse, nao saciar curiosidade |
| **4-5h/semana e pouco tempo para desenvolver** | Gabriel | MEDIA | Gabriel leva base pronta; equipe refina; Gabriel vem presencialmente |
| **Aplicativo mobile vs web** | Alexandre | MEDIA | Gabriel recomendou evitar app stores; solucao via WhatsApp + web resolve |
| **Bot atual (Zenvia) e obvio e ruim** | Lucas/Alexandre | ALTA | Motivacao principal para trocar — agente-linda e conversacional avancado |
| **Historico de 4+ fracassos gera ceticismo** | Equipe | ALTA | Gabriel traz prototipo funcional na sexta para demonstrar diferenca |

---

## 12. Insights Estrategicos

1. **O mercado imobiliario tem peculiaridades que bots genericos nao entendem.** A Trifold ja provou isso 4+ vezes. O diferencial do Gabriel e construir algo customizado.

2. **A Lais era boa e barata (R$1.400/mes).** A referencia de preco da Trifold para "algo que funciona" e nessa faixa. Qualquer proposta acima precisa justificar valor extra.

3. **Lucas e Marcao sao os verdadeiros operadores.** Eles entendem o processo comercial, vao alimentar a IA, e vao usar o sistema. Sao os stakeholders mais criticos para o sucesso.

4. **Alexandre quer comecar IMEDIATAMENTE.** "Eu nao vou mais segurar... eu vou por pra rodar." O momentum e altissimo.

5. **A estrategia de "menos informacao = mais visita" e contra-intuitiva mas essencial.** A IA precisa ser treinada para despertar interesse sem saciar curiosidade.

6. **O modelo de consultoria + desenvolvimento conjunto reduz risco para ambos.** Gabriel nao precisa entregar projeto fechado; Trifold aprende a evoluir sozinha.

7. **Gabriel demonstrou o Reche Studio (branding, criativos, carrosseis) e impressionou.** Oportunidade futura de vender mais servicos.
