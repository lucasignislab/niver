# Documentação Técnica Completa — Projeto LP Ratoeira

## 1) Visão geral do projeto

Este projeto é uma landing page de alta conversão para comercialização dos planos **Ratoeira Ads**, **Combo Ads + Pages** e **Ratoeira Pages**, com foco em:

- comunicação da oferta de aniversário;
- precificação dinâmica por janelas de tempo;
- seleção interativa por bundle e período;
- captura de lead no popup de checkout;
- enriquecimento de checkout com UTMs e identificação de origem;
- integração com webhook do n8n.

O projeto foi construído com Astro e componentes React pontuais para blocos com lógica de renderização/estado em tempo real.

---

## 2) Stack completa

## 2.1 Runtime e framework

- **Node.js**: `>=22.12.0`
- **Astro**: `^6.1.2`
- **Saída**: `static` (build estático)

## 2.2 UI e estilos

- **Tailwind CSS v4** via plugin `@tailwindcss/vite`
- Tokens de tema definidos no CSS global com `@theme`
- Tipografia principal: **Montserrat** (Google Fonts)

## 2.3 Componentização e interação

- **Astro components** (`.astro`) para estrutura principal e seções estáticas
- **React islands** (`.tsx`) para partes que exigem estado/tempo real:
  - `PromoCountdown.tsx`
  - `FAQ.tsx`
  - `ChainCarousel.tsx`

## 2.4 Dependências do projeto (resumo)

- `astro`
- `@astrojs/react`
- `react` + `react-dom`
- `tailwindcss` + `@tailwindcss/vite`
- `framer-motion` / `motion`
- `lucide-react`
- utilitários: `clsx`, `tailwind-merge`

---

## 3) Estrutura de pastas

### Raiz

- `astro.config.mjs` — configuração Astro + React + Tailwind Vite plugin
- `package.json` — scripts e dependências
- `tsconfig.json` — modo strict com base Astro
- `netlify.toml` — configuração de deploy (quando aplicável)

### Aplicação

- `src/pages/index.astro` — composição da página principal
- `src/layouts/Layout.astro` — base HTML, meta e fonte global
- `src/styles/global.css` — design tokens e base theme
- `src/components/*` — blocos visuais e funcionais
- `public/*` — assets estáticos (logos, imagens, ícones, mockups)

---

## 4) Arquitetura de renderização

## 4.1 Página principal

`src/pages/index.astro` monta, em sequência:

1. Header
2. Hero
3. Social proof
4. Countdown promocional (React island)
5. Pricing (núcleo da lógica comercial)
6. Seções de demo/features/resultados
7. FAQ (React island)
8. Footer
9. Botão flutuante WhatsApp

## 4.2 Layout global

`src/layouts/Layout.astro` provê:

- `lang="pt-BR"`
- favicon
- meta description
- import da fonte Montserrat
- aplicação de `global.css`

---

## 5) Design system (implementação atual)

## 5.1 Tokens de cor (Tailwind theme CSS)

Definidos em `src/styles/global.css`:

- `--color-brand-yellow: #FFB800`
- `--color-brand-yellow-hover: #E5A600`
- `--color-brand-dark: #171717`
- `--color-brand-darker: #0A0A0A`
- `--color-brand-light: #FFFFFF`
- `--color-brand-lighter: #F9FAFB`
- `--color-brand-card: #FFFFFF`
- `--color-brand-text: #171717`
- `--color-brand-muted: #6B7280`

## 5.2 Tipografia e peso

- Fonte principal: Montserrat
- Uso intensivo de `font-black` nos elementos de conversão:
  - preços,
  - CTA,
  - badges de oferta,
  - rótulos de etapas.

## 5.3 Componentes visuais recorrentes

- Botões com `rounded-full`, alto contraste, transições curtas.
- Cards com três níveis de destaque:
  - claro padrão,
  - claro com borda/sombra reforçada,
  - escuro premium (`bg-black`) para plano recomendado.
- Selo/Badge de destaque para “melhor valor” e “recomendado”.

## 5.4 Motion e feedback visual

- `hover:scale-*`, `shadow-*`, `transition-all`
- animações utilitárias (`float`, `bounce-slow`)
- cabeçalho com comportamento de shrink no scroll

---

## 6) Núcleo comercial: seção Pricing

Arquivo: `src/components/Pricing.astro`

Essa seção concentra:

- seleção de bundle (ADS, Combo, Pages),
- seleção de período (anual, semestral, mensal, vitalício),
- rendering dos cards correspondentes,
- atualização dinâmica de preços e comparativos,
- popup obrigatório pré-checkout,
- montagem de URL final com parâmetros de automação.

## 6.1 Modelo de seleção

Dois níveis de estado no client script:

- `currentBundle`
- `currentPeriod`

`initPricing()` faz:

1. bind de listeners nos botões de bundle/período;
2. filtro de visibilidade por `data-bundle-group` e `data-period-group`;
3. trigger de `updateDynamicPrices()` após cada troca.

## 6.2 Estratégia de atualização de preço

`updateDynamicPrices()`:

- usa timezone **America/Sao_Paulo**;
- define uma âncora promocional em `14:10`;
- evolui slots de 20 em 20 minutos;
- aplica cronograma de desconto:
  - 35% → 30% → 29% → 28% → 27% → 26% → 25%.

Existe:

- tabela base por bundle/período/plano;
- tabelas exatas por data para evitar arredondamentos indesejados;
- cálculo diferenciado para parcelado e vitalício.

## 6.3 Regras de preço exibido

Para elementos com atributos de dados:

- `data-price-calc-main` (mensal sem parcelado)
- `data-price-calc` (preço à vista comparativo)
- `data-price-parcel-calc` (parcelado)
- `data-price-vitalicio` e `data-price-vitalicio-parcel`

A UI mostra:

- preço original riscado (`line-through`) quando houver desconto;
- preço promocional como valor principal;
- prefixos de parcela (`12x`, `6x`) quando aplicável.

## 6.4 Contraste e legibilidade

Função `normalizeBadgeContrast()` aplica classes distintas para:

- cards escuros;
- cards claros.

Objetivo: evitar texto de baixo contraste em badges de preço.

## 6.5 Counters de desconto

Função `removeCardDiscountCounters()` remove qualquer vestígio de contadores de porcentagem por card, mantendo apenas o sistema de preço dinâmico textual.

---

## 7) Lógica de automação de checkout e n8n

## 7.1 Popup pré-checkout

Ao clicar em qualquer CTA “ASSINAR” nos cards:

1. o clique é interceptado;
2. abre popup com formulário:
   - `name`
   - `email`
   - `phone` (DDI + DDD + número);
3. o `href` original é guardado em `form.dataset.checkoutTarget`.

Também são salvos:

- `checkoutBundle`
- `checkoutPeriod`
- `checkoutButtonId`

## 7.2 Processamento de telefone

`splitPhone(rawPhone)`:

- remove caracteres não numéricos;
- se vier com DDI explícito (mais de 11 dígitos), separa:
  - `phone_local_code` = prefixo (DDI)
  - `phone` = final de 11 dígitos (DDD + número)
- se vier apenas padrão BR (10/11 dígitos), assume:
  - `phone_local_code = "55"`
  - `phone = dígitos informados`

## 7.3 UTMs suportadas

Lidas da URL atual (`window.location.search`) por `extractUtmParams()`:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

## 7.4 Identificadores adicionais enviados

- `id_forms` (id do formulário popup)
- `id_botao` (id do botão clicado, ou fallback sintético)

## 7.5 Mapeamento de cupom automático

Função `getPromoCheckoutCoupon()` mapeia slot/data para cupom:

- 35% → `NIVER35`
- 30% → `NIVER30`
- 29% → `NIVER29`
- 28% → `NIVER28`
- 27% → `NIVER27`
- 26% → `NIVER26`
- 25% → `NIVER25`

Regra aplicada:

- **mensal/semestral/anual**: inclui `coupon`
- **vitalício**: não inclui `coupon`

## 7.6 Montagem de URL final para checkout

A URL final é criada com:

- base do checkout original (`checkoutTarget`)
- querystring codificada via `encodeURIComponent`:
  - garante espaço como `%20`

Parâmetros usados:

- `name`
- `phone_local_code`
- `phone`
- `email`
- `id_forms`
- `id_botao`
- UTMs
- `coupon` (somente não-vitalício)

## 7.7 Envio para webhook n8n

Webhook:

- `POST https://n8n.srv1145908.hstgr.cloud/webhook/checkout-niver-2-anos`

Payload inclui:

- contexto do checkout (`checkout_url`, `checkout_url_com_dados`)
- `bundle`, `period`
- dados do lead (`name`, `email`, `phone_local_code`, `phone`)
- rastreio (`id_forms`, `id_botao`, UTMs)
- `coupon` quando aplicável

Configuração de envio:

- `Content-Type: application/json`
- `mode: "no-cors"`
- `keepalive: true`
- timeout de corrida para não bloquear redirecionamento

Após tentativa de POST, usuário é redirecionado para a URL final do checkout.

---

## 8) Countdown promocional (sincronização com pricing)

Arquivo: `src/components/PromoCountdown.tsx`

Responsabilidades:

- exibir faixa atual de desconto;
- mostrar tempo restante para próxima virada;
- indicar visualmente progresso do slot (anel circular).

O cronograma (14:10 em diante, intervalos de 20 min) está alinhado com o conceito da precificação dinâmica da seção Pricing, garantindo coerência de comunicação.

---

## 9) Navegação e UX de conversão

## 9.1 Header

- links de âncora:
  - `#integracoes`
  - `#planos`
  - `#demo`
  - `#faq`
- botão principal “VER OFERTA” direciona para `#planos`
- comportamento sticky com blur/shadow após scroll

## 9.2 CTA WhatsApp flutuante

Implementado em `src/pages/index.astro`:

- fixo à direita inferior;
- imagem usada do `public`:
  - `/toppng.com-logo-icono-whatsapp-whatsa-465x465.png`
- link:
  - `https://api.whatsapp.com/send/?phone=5519997278153&text=Ol%C3%A1%2C+vim+do+site+e+quero+falar+com+um+atendente&type=phone_number&app_absent=0`

Observação técnica:

- aplicado `drop-shadow` para respeitar transparência do PNG (evita “caixa quadrada” de sombra).

---

## 10) Mapa funcional das principais seções/componentes

- `Header.astro` — navegação principal e branding
- `Hero.astro` — proposta de valor inicial
- `SocialProof.astro` / `SocialProofMarquee.astro` — validação social
- `PromoCountdown.tsx` — urgência temporal da oferta
- `Pricing.astro` — pricing dinâmico + checkout orchestration
- `ProductDemo.astro` — seção “Como funciona”
- `HighConversionFeatures.astro` — recursos e benefícios
- `ChainCarousel.tsx` — vitrine de integrações/plataformas
- `ResultsOnStatement.astro` — prova de resultado
- `FAQ.tsx` — objeções e dúvidas
- `Footer.astro` — fechamento institucional

---

## 11) Build, execução e operação

## 11.1 Scripts

- `npm run dev` — desenvolvimento local
- `npm run build` — build de produção (estático)
- `npm run preview` — preview local da build

## 11.2 Estado atual de validação

- Build está passando com sucesso.
- Warning não-bloqueante existente:
  - imports não usados em `src/components/Footer.tsx` (`Mail`, `ExternalLink`).

---

## 12) Boas práticas e cuidados operacionais

- Evitar alterar seletor/data-attributes de pricing sem revisar script client.
- Manter sincronia entre:
  - cronograma do countdown;
  - cronograma de desconto/cupom no pricing.
- Validar em produção:
  - parâmetros da URL de checkout;
  - recebimento do payload no n8n;
  - aplicação correta de cupom por período.
- Preservar legibilidade de badges em cards escuros/claros ao mexer em classes.

---

## 13) Checklist de QA recomendado (pós-alteração)

1. Trocar entre bundles e períodos e validar visibilidade correta dos cards.
2. Conferir atualização de preço sem refresh completo.
3. Clicar em CTA, preencher popup e validar:
   - DDI/DDD/telefone;
   - URL final com `%20` em nomes compostos;
   - UTMs persistidas;
   - `coupon` presente apenas em não-vitalício.
4. Confirmar chamada ao webhook n8n.
5. Validar contraste visual de badges e CTA em desktop/mobile.
6. Executar `npm run build`.

---

## 14) Referências de arquivo (pontos centrais)

- `astro.config.mjs`
- `package.json`
- `src/styles/global.css`
- `src/layouts/Layout.astro`
- `src/pages/index.astro`
- `src/components/Pricing.astro`
- `src/components/PromoCountdown.tsx`
- `src/components/Header.astro`

---

## 15) Resumo executivo técnico

A solução atual combina:

- **front-end estático de alta performance** (Astro);
- **interatividade orientada à conversão** (JS client + React islands);
- **motor de precificação temporal** com regras comerciais explícitas;
- **orquestração de checkout** com pré-preenchimento de dados + rastreio UTM;
- **integração de automação via n8n** com payload estruturado;
- **design system consistente** baseado em tokens de marca e contraste controlado.

O resultado é uma LP orientada a performance comercial com governança clara das regras de preço, cupom e rastreabilidade de aquisição.
