# WhatsApp Cloud API - Custos e Limites Detalhados (Brasil 2025/2026)

> Pesquisa realizada em 31/03/2026. Fontes oficiais e de terceiros confiados.
> **IMPORTANTE:** A Meta mudou o modelo de precificacao em 1 de julho de 2025 — de "por conversa 24h" para "por mensagem de template entregue".

---

## 1. Limites de Throughput (Mensagens por Segundo)

### Resumo

| Modo | Throughput (MPS) | Observacao |
|------|-----------------|------------|
| Cloud API (padrao) | **80 msg/s** | Por numero de telefone |
| Cloud API (upgraded) | **ate 1.000 msg/s** | Upgrade automatico ou sob solicitacao |
| Coexistence Mode | **20 msg/s** (algumas fontes citam 5 msg/s) | Numero compartilhado entre App + API |

### Detalhes

- **O limite de 80 msg/s e POR NUMERO DE TELEFONE**, nao por WABA.
- Se voce tiver 3 numeros, cada um tem 80 msg/s independentes = 240 msg/s no total.
- No **Coexistence Mode** (mesmo numero no WhatsApp Business App + Cloud API), o throughput cai para **~20 msg/s** (ou 5 msg/s em algumas implementacoes). Este e o custo de manter o app e a API simultaneamente.

### Como aumentar o limite de 80 para 1.000 msg/s

1. Ter **messaging tier ilimitado** (100K+ contatos unicos/dia)
2. Manter **quality score Yellow ou Green**
3. Enviar mensagens para **100.000 usuarios unicos em 24h** fora de janelas de suporte
4. Solicitar upgrade a Meta com **pelo menos 3 dias de antecedencia** antes de campanhas

### Mudanca importante (Q1-Q2 2026)

- Desde outubro 2025, os **messaging limits passaram a ser POR Business Portfolio**, nao mais por numero individual.
- Todos os numeros dentro do mesmo Business Manager herdam automaticamente o tier mais alto.
- A Meta esta removendo os tiers de 2K e 10K mensagens diarias; apos Business Verification, o negocio recebe automaticamente **100K mensagens diarias**.

---

## 2. Categorias de Mensagem e Precos (Brasil, USD)

### Modelo de Precificacao (vigente desde 01/07/2025)

- Cobranca **por mensagem de template entregue** (nao mais por conversa de 24h)
- Preco depende do **pais do destinatario** (nao do remetente)
- Mensagens de servico (cliente inicia) sao **GRATIS e ilimitadas**

### Tabela de Precos - Brasil (2026)

| Categoria | Preco por Mensagem (USD) | Preco Estimado (BRL ~5,80) | Observacoes |
|-----------|--------------------------|---------------------------|-------------|
| **Marketing** | $0.0625 | ~R$ 0,36 | Promocoes, ofertas, reativacao. Sempre cobrada. Sem desconto por volume. |
| **Utility** (1-1.000/mes) | $0.0068 | ~R$ 0,039 | Confirmacoes, lembretes, atualizacoes |
| **Utility** (1.001-10.000/mes) | $0.0065 | ~R$ 0,038 | Desconto automatico por volume |
| **Utility** (10.001+/mes) | ~$0.0060* | ~R$ 0,035 | *Estimado, desconto progressivo |
| **Authentication** | $0.0078 | ~R$ 0,045 | OTP, codigos de verificacao |
| **Service** (cliente inicia) | **GRATIS** | **R$ 0,00** | Ilimitado. Dentro da janela de 24h. |

> *Os precos de Utility e Authentication tem desconto automatico por volume mensal. Marketing NAO tem desconto por volume.*
> *Cobranca em BRL prevista para H2 2026 (julho 2026+).*

### Novidade: Max-Price Bidding (Marketing)

A Meta introduziu um modelo de **lances com preco maximo** para mensagens de marketing, que pode reduzir custos em ate **25%** dependendo da demanda no momento do envio.

---

## 3. O que e GRATIS vs PAGO

### Cenarios Gratuitos

| Cenario | Custo | Detalhes |
|---------|-------|---------|
| Lead inicia conversa (qualquer origem) | **GRATIS** | Abre janela de 24h. Respostas de texto livre sao gratis. |
| Click-to-WhatsApp Ads (lead clica) | **GRATIS por 72h** | Janela estendida! Inclui ate templates de marketing. |
| Corretor responde dentro de 24h com texto livre | **GRATIS** | Nao e template, e mensagem de sessao. |
| Utility template dentro da janela de 24h | **GRATIS** | Desde julho 2025, utility na janela de servico e gratis. |

### Cenarios Pagos

| Cenario | Categoria | Custo (USD) |
|---------|-----------|-------------|
| Corretor envia template de follow-up no dia seguinte (fora da janela) | **Utility** | $0.0068 |
| Empresa envia promocao/oferta ativa | **Marketing** | $0.0625 |
| Empresa envia OTP/codigo de verificacao | **Authentication** | $0.0078 |
| Empresa envia marketing dentro de janela de 24h | **Marketing** | $0.0625 (sempre cobrada!) |
| Empresa reenvia template apos 24h sem resposta | Depende da categoria | Cobrada normalmente |

### Regras Importantes

1. **Janela de 24h**: Abre quando o cliente envia mensagem. Dentro dela, respostas de texto livre e utility templates sao gratis.
2. **Fora da janela de 24h**: Obrigatorio usar template message aprovado. Cobrado por entrega.
3. **Marketing e SEMPRE cobrada**: Mesmo dentro da janela de 24h, templates de marketing sao cobrados.
4. **Templates**: Aprovacao e gratuita. O custo e por envio/entrega, nao por aprovacao.
5. **Click-to-WhatsApp Ads**: Janela estendida de 72h (vs 24h normal). TODOS os tipos de template sao gratis nessa janela.

---

## 4. Cenarios de Custo para a Trifold

### Premissas

- Cambio: USD 1 = BRL 5,80 (referencia)
- Lead inicia conversa = Service (GRATIS)
- Corretor responde dentro de 24h = GRATIS (texto livre)
- Corretor envia template de confirmacao/follow-up FORA da janela = Utility ($0.0068)
- Reativacao de base fria = Marketing ($0.0625)

---

### Cenario A: Volume Baixo (Fase Validacao)

| Item | Qtd/mes | Categoria | Preco Unit. (USD) | Total (USD) | Total (BRL) |
|------|---------|-----------|-------------------|-------------|-------------|
| Leads novos (lead inicia) | 200 | Service | $0.00 | $0.00 | R$ 0,00 |
| Respostas do corretor (dentro 24h) | 200 | Service (texto livre) | $0.00 | $0.00 | R$ 0,00 |
| Msg ativas do corretor (fora janela) | 100 | Utility | $0.0068 | $0.68 | R$ 3,94 |
| Marketing (reativacao base fria) | 50 | Marketing | $0.0625 | $3.13 | R$ 18,13 |
| **TOTAL** | **550** | | | **$3.81** | **R$ 22,07** |

---

### Cenario B: Volume Medio (Pos-lancamento Yarden)

| Item | Qtd/mes | Categoria | Preco Unit. (USD) | Total (USD) | Total (BRL) |
|------|---------|-----------|-------------------|-------------|-------------|
| Leads novos (lead inicia) | 500 | Service | $0.00 | $0.00 | R$ 0,00 |
| Respostas do corretor (dentro 24h) | 500 | Service (texto livre) | $0.00 | $0.00 | R$ 0,00 |
| Msg ativas do corretor (fora janela) | 300 | Utility | $0.0068 | $2.04 | R$ 11,83 |
| Marketing (reativacao base fria) | 200 | Marketing | $0.0625 | $12.50 | R$ 72,50 |
| **TOTAL** | **1.500** | | | **$14.54** | **R$ 84,33** |

---

### Cenario C: Volume Alto (Campanha Forte)

| Item | Qtd/mes | Categoria | Preco Unit. (USD) | Total (USD) | Total (BRL) |
|------|---------|-----------|-------------------|-------------|-------------|
| Leads novos (lead inicia) | 1.000 | Service | $0.00 | $0.00 | R$ 0,00 |
| Respostas do corretor (dentro 24h) | 1.000 | Service (texto livre) | $0.00 | $0.00 | R$ 0,00 |
| Msg ativas do corretor (fora janela) | 600 | Utility | $0.0068 | $4.08 | R$ 23,66 |
| Marketing (reativacao/campanhas) | 500 | Marketing | $0.0625 | $31.25 | R$ 181,25 |
| **TOTAL** | **3.100** | | | **$35.33** | **R$ 204,91** |

---

### Resumo Comparativo

| Cenario | Msgs Totais | Custo Meta (USD) | Custo Meta (BRL) | Custo/msg media |
|---------|-------------|------------------|------------------|-----------------|
| A - Validacao | 550 | $3.81 | R$ 22,07 | R$ 0,04 |
| B - Pos-lancamento | 1.500 | $14.54 | R$ 84,33 | R$ 0,06 |
| C - Campanha forte | 3.100 | $35.33 | R$ 204,91 | R$ 0,07 |

> **Nota**: O custo por mensagem media sobe conforme aumenta a proporcao de marketing vs service.
> **Insight**: O custo da API da Meta e extremamente baixo. O custo real esta no BSP/plataforma, nao nas mensagens.

---

## 5. Custo de Infraestrutura

### Cloud API (hospedada pela Meta)

| Item | Custo |
|------|-------|
| Hospedagem da API | **GRATIS** (Meta hospeda) |
| Acesso a API | **GRATIS** (sem taxa de assinatura) |
| Mensagens enviadas | Cobradas conforme tabela acima |
| Aprovacao de templates | **GRATIS** |
| Numero de telefone | Precisa de um numero verificado (pode ser seu proprio) |

### Usar direto SEM BSP?

**SIM, e possivel.** A Meta permite acesso direto a Cloud API sem intermediarios. Porem:

| Aspecto | Direto (sem BSP) | Com BSP |
|---------|-------------------|---------|
| Custo mensal fixo | $0 | $50-$500+/mes |
| Markup por mensagem | 0% | 10-30% tipicamente |
| Dashboard/interface | Precisa construir | Incluso |
| Suporte se numero banido | Nenhum (direto Meta) | BSP ajuda |
| Velocidade de setup | Mais lento | Mais rapido |
| Integracao | Voce constroi | Pre-pronto |

### BSPs Brasileiros (referencia de precos)

| BSP | Custo mensal tipico | Markup | Observacao |
|-----|---------------------|--------|------------|
| Twilio | ~$15/mes (numero) + markup | Markup sobre Meta | Popular, bom docs |
| Z-API | Planos a partir de ~R$ 50/mes | Variavel | Brasileiro, popular |
| ChatPro | ~R$ 79-199/mes | Incluso no plano | Brasileiro |
| 360dialog | $0 fixo | Markup pequeno | Sem dashboard proprio |
| Respond.io | $79+/mes | Sem markup Meta | Dashboard completo |
| Umbler | ~R$ 99/mes+ | Incluso | Brasileiro, suporte local |

### Recomendacao para Trifold

Para a Trifold, que ja tera uma plataforma propria (CRM):

1. **Fase MVP**: Usar Cloud API direto da Meta. Custo = apenas mensagens (~R$ 22/mes no cenario A).
2. **Se precisar de suporte**: Considerar 360dialog (sem custo fixo, markup baixo) ou Z-API (brasileiro, barato).
3. **Construir a integracao no CRM**: A Cloud API e REST, relativamente simples de integrar.

---

## 6. Dicas de Otimizacao de Custo

1. **Maximize respostas dentro de 24h**: Tudo que o corretor responder na janela e gratis.
2. **Use Click-to-WhatsApp Ads**: Janela de 72h gratis para TODOS os tipos de template.
3. **Classifique templates corretamente**: Utility ($0.0068) custa 9x menos que Marketing ($0.0625).
4. **Nao abuse de Marketing**: Reserve marketing apenas para reativacao de base fria. Confirmacoes e lembretes sao utility.
5. **Max-Price Bidding**: Para campanhas de marketing em volume, use o sistema de lances para potencialmente economizar ate 25%.
6. **Utility na janela de 24h e gratis**: Se o lead acabou de enviar mensagem, envie o template de utility agora (gratis) em vez de esperar.

---

## Fontes

- [Meta Official - WhatsApp Business Platform Pricing](https://business.whatsapp.com/products/platform-pricing)
- [Meta Developers - Pricing Documentation](https://developers.facebook.com/docs/whatsapp/pricing/)
- [Meta Developers - Messaging Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits/)
- [FlowCall - WhatsApp Business API Pricing 2026](https://www.flowcall.co/blog/whatsapp-business-api-pricing-2026)
- [Chatarmin - WhatsApp API Pricing 2026](https://chatarmin.com/en/blog/whats-app-api-pricing)
- [YCloud - WhatsApp API Pricing Update July 2025](https://www.ycloud.com/blog/whatsapp-api-pricing-update)
- [Authkey - WhatsApp Pricing Update 2026](https://authkey.io/blogs/whatsapp-pricing-update-2026/)
- [Spur - WhatsApp Business API Pricing Complete Guide 2026](https://www.spurnow.com/en/blogs/whatsapp-business-api-pricing-explained)
- [WuSeller - Scale WhatsApp Cloud API Throughput Limits 2026](https://www.wuseller.com/whatsapp-business-knowledge-hub/scale-whatsapp-cloud-api-master-throughput-limits-upgrades-2026/)
- [Respond.io - WhatsApp API Pricing 2026](https://respond.io/blog/whatsapp-business-api-pricing)
- [ChatMaxima - WhatsApp Max-Price Bidding Guide 2026](https://chatmaxima.com/blog/whatsapp-max-price-bidding-guide-2026/)
- [Umbler Blog - Custo API Oficial do WhatsApp 2026](https://blog.umbler.com/br/custo-api-oficial-do-whatsapp-2026/)
- [ChatLabs - Custo do WhatsApp API em 2025/2026](https://www.chatlabs.com.br/o-que-e-o-whatsapp-api-a-versao-profissional-do-whatsapp-para-empresas-copy)
