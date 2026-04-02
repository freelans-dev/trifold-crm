# SaaS Benchmarks por Estágio

Referência de benchmarks para comparação no QBR. Baseado em dados de SaaStr (Jason Lemkin), OpenView, Bessemer, KeyBanc.

---

## Estágios de SaaS

| Estágio | MRR | ARR Equivalente | Descrição |
|---------|-----|-----------------|-----------|
| Pre-revenue | R$0 | R$0 | Produto em desenvolvimento |
| Early | R$1K-10K | R$12K-120K | Primeiros clientes pagantes |
| Growth | R$10K-50K | R$120K-600K | Product-market fit encontrado |
| Scale | R$50K-200K | R$600K-2.4M | Escalando canais de aquisição |
| Expansion | R$200K+ | R$2.4M+ | Múltiplos canais, expansão |

---

## Benchmarks por Estágio

### Pre-revenue / Early (MRR < R$10K)

| Métrica | Mediano | Bom | Excelente |
|---------|---------|-----|-----------|
| MRR Growth (m/m) | 15% | 20% | 30%+ |
| Gross Churn (mensal) | 8% | 5% | 3% |
| NRR | 90% | 100% | 110% |
| Trial→Paid | 5% | 10% | 15%+ |
| CAC Payback (meses) | 18 | 12 | 6 |
| LTV/CAC | 1.5x | 3x | 5x+ |
| ARPU | — | — | Depende do mercado |
| Gross Margin | 60% | 70% | 80%+ |
| NPS | 20 | 40 | 60+ |
| DAU/MAU | 10% | 20% | 30%+ |

### Growth (MRR R$10K-50K)

| Métrica | Mediano | Bom | Excelente |
|---------|---------|-----|-----------|
| MRR Growth (m/m) | 10% | 15% | 20%+ |
| Gross Churn (mensal) | 5% | 3% | 2% |
| NRR | 100% | 105% | 115%+ |
| Trial→Paid | 8% | 12% | 18%+ |
| CAC Payback (meses) | 15 | 10 | 6 |
| LTV/CAC | 2x | 4x | 6x+ |
| Gross Margin | 65% | 75% | 85%+ |
| NPS | 30 | 45 | 65+ |
| DAU/MAU | 15% | 25% | 35%+ |
| Revenue per Employee | R$10K | R$15K | R$25K+ |

### Scale (MRR R$50K-200K)

| Métrica | Mediano | Bom | Excelente |
|---------|---------|-----|-----------|
| MRR Growth (m/m) | 7% | 10% | 15%+ |
| Gross Churn (mensal) | 3% | 2% | 1.5% |
| NRR | 105% | 110% | 120%+ |
| Trial→Paid | 10% | 15% | 22%+ |
| CAC Payback (meses) | 12 | 8 | 5 |
| LTV/CAC | 3x | 5x | 8x+ |
| Gross Margin | 70% | 78% | 85%+ |
| NPS | 35 | 50 | 70+ |
| Quick Ratio (SaaS) | 2 | 3 | 4+ |
| Rule of 40 | 20% | 40% | 60%+ |

### Expansion (MRR R$200K+)

| Métrica | Mediano | Bom | Excelente |
|---------|---------|-----|-----------|
| MRR Growth (m/m) | 5% | 8% | 12%+ |
| Gross Churn (mensal) | 2% | 1.5% | 1% |
| NRR | 110% | 115% | 130%+ |
| CAC Payback (meses) | 10 | 7 | 4 |
| LTV/CAC | 4x | 6x | 10x+ |
| Gross Margin | 75% | 80% | 88%+ |
| Quick Ratio (SaaS) | 2.5 | 3.5 | 4.5+ |
| Rule of 40 | 30% | 40% | 60%+ |
| Magic Number | 0.5 | 0.75 | 1.0+ |

---

## Métricas Explicadas

### Quick Ratio (SaaS)
```
Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
```
- < 1: Encolhendo
- 1-2: Crescimento lento
- 2-4: Crescimento saudável
- 4+: Crescimento forte

### Rule of 40
```
Rule of 40 = Revenue Growth Rate % + Profit Margin %
```
- < 20%: Preocupante
- 20-40%: Aceitável
- 40%+: Saudável (target para Series B+)

### Magic Number
```
Magic Number = (QoQ Revenue Increase × 4) / Previous Quarter S&M Spend
```
- < 0.5: Ineficiente — reduzir spend
- 0.5-0.75: OK — otimizar
- 0.75-1.0: Eficiente — manter
- 1.0+: Muito eficiente — investir mais

### Net Revenue Retention (NRR)
```
NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR × 100
```
- < 90%: Balde furado
- 90-100%: Neutro
- 100-110%: Bom
- 110-130%: Excelente (best-in-class)
- 130%+: Elite

### LTV/CAC
```
LTV = ARPU × Gross Margin / Monthly Churn Rate
CAC = Total S&M Spend / New Customers
```
- < 1x: Queimando dinheiro
- 1-3x: Precisando otimizar
- 3-5x: Saudável
- 5x+: Excelente (ou subinvestindo em growth)

---

## Benchmarks por Vertical (Brasil)

| Vertical | ARPU Típico | Churn Típico | Trial→Paid |
|----------|-------------|-------------|------------|
| EdTech B2C | R$50-200 | 6-10% | 3-8% |
| EdTech B2B | R$200-2K | 3-6% | 8-15% |
| SaaS Horizontal B2B | R$100-500 | 4-7% | 5-12% |
| SaaS Vertical B2B | R$200-2K | 2-5% | 8-18% |
| Marketplace | R$50-300 | 5-8% | 10-20% |
| AI/Automation | R$200-1K | 4-8% | 5-15% |

---

## Como usar neste QBR

1. **Identificar estágio** de cada plataforma pelo MRR atual
2. **Comparar** cada métrica com o benchmark do estágio correspondente
3. **Classificar** como Below (< mediano), At (mediano-bom), Above (bom+), Elite (excelente+)
4. **Priorizar** gaps onde a plataforma está Below benchmark
5. **Celebrar** onde está Above — e documentar o que está funcionando
