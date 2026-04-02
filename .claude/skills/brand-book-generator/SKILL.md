---
name: brand-book-generator
description: "Template e processo para criação de Brand Books completos e consistentes. Use esta skill SEMPRE que o agente Scher (Liquid System Architect) precisar criar, expandir ou documentar um sistema de identidade visual. Também use quando o Bauhaus precisar consultar a estrutura esperada do Brand Book para aplicar corretamente. Trigger: menções a 'brand book', 'brand guide', 'manual de marca', 'identidade visual', 'sistema visual', 'design system', 'liquid identity', 'paleta de cores', 'tipografia da marca', 'guidelines visuais'."
---

# Brand Book Generator — Guia do Liquid System Architect

## Visão Geral

O Brand Book é a ferramenta mais prática do squad. Não é um PDF bonito que ninguém lê — é um manual vivo que permite ao Bauhaus (e a qualquer designer futuro) aplicar a marca sem ambiguidade. Cada decisão deve ser justificada, cada regra deve ter exemplo.

## Estrutura Obrigatória do Brand Book

O Brand Book DEVE conter todas as seções abaixo, nesta ordem:

---

### Seção 1: Essência da Marca (1-2 páginas)

**Conteúdo:**
- Golden Circle resumido (WHY / HOW / WHAT) — extraído do brief do Neumeier
- ZAG Statement
- Personalidade da marca (traços "Somos X, não Y") — extraída do brief
- Manifesto resumido (1 parágrafo) — do Bierut

**Propósito:** Contextualizar TODAS as decisões visuais que seguem. Um designer deve ler esta seção e entender o "porquê" por trás de cada escolha.

---

### Seção 2: Logotipo

**Conteúdo obrigatório:**

```
2.1 Especificação Tipográfica / Geométrica EXECUTÁVEL
    OBRIGATÓRIO — sem isso o Bauhaus não consegue reproduzir.
    Para wordmarks:
    - Fonte exata + peso para cada parte (ex: "Aluno = Plus Jakarta Sans SemiBold 600")
    - Cor de cada parte com hex (ex: "PRO = #6D28D9")
    - Letter-spacing da composição
    - Variação dark mode (cores diferentes)
    - Variação monocromática (qual peso usar, qual cor única)

    Para símbolos/monogramas:
    - Grid base em px (ex: "32x32px — escala proporcional")
    - Descrição geométrica executável: ângulos, proporções, curvas bezier
    - Princípio construtivo (ex: "traço vertical do A compartilhado com o P")
    - Stroke width em relação ao grid
    - Padding visual interno

2.2 Versão Principal
    - Logo principal em fundo claro
    - Logo principal em fundo escuro

2.3 Versões Alternativas
    - Versão horizontal / vertical (se houver)
    - Versão monocromática (preto)
    - Versão monocromática (branco)
    - Ícone / símbolo isolado (se aplicável)
    - Versão reduzida (favicon, avatar)

2.4 Área de Proteção
    - Definir unidade de medida (ex: "x" = altura do símbolo)
    - Espaço mínimo ao redor do logo

2.5 Tamanho Mínimo
    - Digital: largura mínima em pixels
    - Impresso: largura mínima em mm

2.6 Usos Incorretos (mínimo 6 exemplos)
    - Não distorcer
    - Não alterar cores
    - Não rotacionar
    - Não adicionar efeitos (sombra, brilho, outline)
    - Não colocar sobre fundo que comprometa legibilidade
    - Não alterar proporções dos elementos
```

---

### Seção 3: Cores

**Conteúdo obrigatório:**

```
3.1 Paleta Primária (2-4 cores)
    Para cada cor:
    - Nome da cor (nome proprietário da marca)
    - HEX
    - RGB
    - CMYK
    - Pantone (se aplicável)
    - Proporção de uso recomendada (ex: "60% das composições")

3.2 Paleta Secundária (2-4 cores)
    - Mesmos códigos
    - Quando usar (ex: "acentos, destaques, CTAs")

3.3 Paleta de Apoio / Neutros (2-3 cores)
    - Fundos, textos, separadores

3.4 Gradientes (se houver)
    - Direção, pontos de cor, quando usar

3.5 Regras de Combinação
    - Combinações permitidas (com exemplos)
    - Combinações proibidas (com exemplos)
    - Razão de contraste mínimo para texto sobre fundo (WCAG AA: 4.5:1)
    - ATENÇÃO: Para cores de acento (success, error, warning), verificar se passam 4.5:1
      para texto NORMAL (não apenas grande). Se não passarem, definir versões escuras
      (ex: Emerald 700 para texto pequeno sobre fundo branco, Emerald 500 apenas para
      backgrounds e ícones grandes 24px+). Documentar ambas as versões na paleta.

3.6 Cor em Contexto
    - Como as cores se aplicam em UI (botões, links, alertas)
    - Como as cores se aplicam em materiais impressos
```

---

### Seção 4: Tipografia

**Conteúdo obrigatório:**

```
4.1 Família Tipográfica Primária
    - Nome da fonte
    - Pesos disponíveis (Regular, Medium, Bold, etc.)
    - Onde usar (headlines, títulos, destaques)
    - Link para download/licença

4.2 Família Tipográfica Secundária
    - Nome da fonte
    - Pesos disponíveis
    - Onde usar (corpo de texto, legendas, UI)
    - Link para download/licença

4.3 Família Substituta (fallback)
    - Para quando as fontes primárias não estão disponíveis (ex: e-mail, Google Docs)
    - Geralmente: fonte do sistema (Arial, Helvetica, Georgia)

4.4 Hierarquia Tipográfica
    | Elemento | Fonte | Peso | Tamanho | Line-height | Letter-spacing |
    |----------|-------|------|---------|-------------|----------------|
    | H1 | | | | | |
    | H2 | | | | | |
    | H3 | | | | | |
    | Body | | | | | |
    | Caption | | | | | |
    | CTA/Button | | | | | |

4.5 Regras de Uso
    - Nunca usar ALL CAPS em body text
    - Bold apenas para [especificar]
    - Itálico apenas para [especificar]
```

---

### Seção 5: Grid & Layout

**Conteúdo obrigatório:**

```
5.1 Princípios de Layout
    - Descrição do sistema (ex: "grid de 12 colunas com gutter de 24px")
    - Margens padrão por mídia

5.2 Grid Digital
    - Desktop: colunas, gutters, margens
    - Tablet: adaptação
    - Mobile: adaptação

5.3 Grid Impresso
    - A4/Letter: colunas, margens
    - Outros formatos relevantes

5.4 Espaçamento
    - Sistema de espaçamento (ex: múltiplos de 8px)
    - Espaçamento entre seções
    - Espaçamento entre elementos

5.5 Exemplos de Aplicação
    - Layout de página web
    - Layout de post social
    - Layout de material impresso
```

---

### Seção 6: Elementos Gráficos de Apoio

**Conteúdo obrigatório:**

```
6.1 Elementos Gráficos (se houver)
    - Patterns, texturas, formas geométricas
    - Regras de uso e aplicação
    - Variações permitidas

6.2 Iconografia (se houver)
    - Estilo dos ícones (line, filled, duotone)
    - Tamanhos padrão
    - Cor dos ícones
    - Para ícones customizados de marca: especificação EXECUTÁVEL obrigatória:
      * Grid base (ex: 24x24px viewbox)
      * Stroke width (ex: 1.5px)
      * Linecap e linejoin
      * Descrição geométrica de cada forma (ângulos, curvas, proporções)
      * Equivalente de biblioteca (ex: "MVP: usar <Zap /> do Lucide")
      Sem spec executável, o ícone não pode ser produzido com consistência.

6.3 Ilustrações (se houver)
    - Estilo de ilustração
    - Paleta de cores para ilustrações
    - Do's e Don'ts
```

---

### Seção 7: Fotografia & Imagem

**Conteúdo obrigatório:**

```
7.1 Estilo Fotográfico
    - Descrição do estilo (ex: "natural, com luz ambiente, cores quentes")
    - Mood board com 5-8 referências
    - Tipos de imagem preferidos (pessoas, produto, lifestyle, abstrato)

7.2 Tratamento de Imagem
    - Filtros ou ajustes padrão (se houver)
    - Overlay de cor (se houver)
    - Regras de recorte/enquadramento

7.3 Do's e Don'ts
    - Exemplos de imagens que FUNCIONAM com a marca
    - Exemplos de imagens que NÃO FUNCIONAM
```

---

### Seção 8: Tom de Voz (resumo visual)

**Conteúdo:** Resumo visual do Brand Voice Guide do Bierut, integrado ao Brand Book para referência rápida. Não substitui o Voice Guide completo — apenas garante que a voz esteja visualmente presente no documento.

```
8.1 Espectros de Voz (visual)
    Formal ●○○○○ Casual
    Sério  ○○●○○ Divertido
    Técnico ○○○●○ Acessível

8.2 Exemplos de Tom por Canal (tabela resumida)
8.3 Link para o Voice Guide completo do Bierut
```

---

### Seção 9: Aplicações de Referência

**Conteúdo obrigatório (mínimo 8 aplicações):**

```
Digitais:
- Post Instagram (feed + stories)
- Banner web (desktop + mobile)
- E-mail marketing (header + body)
- Avatar e capa de perfil

Impressos:
- Cartão de visita
- Papel timbrado / envelope
- Apresentação (slides)
- Material adicional relevante (folder, flyer, embalagem)
```

Cada aplicação deve mostrar a marca em contexto realista, não apenas o logo isolado.

---

### Seção 10: Downloads & Recursos

```
10.1 Arquivos do Logotipo
    - Formatos: SVG, PNG (transparente), JPG, PDF
    - Versões: principal, alternativas, monocromáticas

10.2 Fontes
    - Links para download ou instalação

10.3 Templates
    - Post social (Canva/Figma)
    - Apresentação (Google Slides/PowerPoint)
    - Papelaria (Word/InDesign)
```

---

## Checklist de Completude

Antes de entregar o Brand Book, o Scher deve validar:

- [ ] Todas as 10 seções estão presentes
- [ ] Cada cor tem todos os códigos (HEX, RGB, CMYK, Pantone)
- [ ] Cores de acento testadas para contraste WCAG AA — versões escuras documentadas para texto pequeno
- [ ] Logo tem especificação tipográfica/geométrica EXECUTÁVEL (não apenas conceitual)
- [ ] Ícones customizados têm spec executável OU equivalente de biblioteca definido para MVP
- [ ] A hierarquia tipográfica cobre todos os casos de uso
- [ ] Há pelo menos 6 exemplos de uso incorreto do logo
- [ ] O grid é documentado para digital E impresso
- [ ] Há pelo menos 8 aplicações de referência (mínimo 4 externas ao produto)
- [ ] O documento é navegável (índice, seções claras)
- [ ] Um designer sem contexto prévio consegue aplicar a marca usando apenas este documento

## Formato de Entrega

O Brand Book pode ser entregue como:
1. **Documento Markdown** (para consulta rápida e versionamento)
2. **Apresentação PPTX** (para apresentação ao cliente)
3. **PDF** (para distribuição final)

O Scher deve perguntar ao usuário qual formato prefere, ou entregar em Markdown como padrão (mais fácil de iterar).
