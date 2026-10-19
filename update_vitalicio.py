import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

ads_plus_items = [
    "30 perfis de Google Conectados",
    "150 ratoeiras automáticas",
    "Conta de anúncio ilimitadas"
]

combo_plus_items = [
    "30 perfis de Google Conectados",
    "150 ratoeiras automáticas",
    "Contas de anúncio ilimitadas",
    "Hospedagem Grátis",
    "10 domínios conectados",
    "500.000 Acessos mensais",
    "Páginas ilimitadas",
    "Tutorial Passo a Passo",
    "Suporte Via WhatsApp",
    "Domínio Customizado",
    "E-Book de Estratégia Mensal"
]

def build_li(items, text_class=""):
    html = ""
    for item in items:
        cls = f"flex items-start gap-3 {text_class}".strip()
        html += f'              <li class="{cls}"><svg class="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">{item}</span></li>\n'
    return html.strip()

# We have 4 vitalicio cards:
# 1. Ads Ratazana
# 2. Ads Ratazana Plus
# 3. Combo Ratazana
# 4. Combo Ratazana Plus

# Let's replace by finding the sections and the <ul> block just before the ASSINAR links.
# Instead of regex over arbitrary text, let's just do a specific replacement.

# Ads Ratazana Vitalicio
old_ads_ratazana_ul = """<ul class="space-y-4 mb-12 grow text-sm font-bold">
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Blindagem Ratoeira Ads</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Suporte em Horário Comercial</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Sem mensalidade nunca mais</li>
            </ul>"""

# Ads Ratazana Plus Vitalicio
old_ads_ratazana_plus_ul = """<ul class="space-y-4 mb-12 grow text-sm font-bold">
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Domínios/Cliques Ilimitados</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Suporte Prioritário VIP</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Acesso por Tempo Ilimitado</li>
            </ul>"""

# Combo Ratazana Vitalicio
old_combo_ratazana_ul = """<ul class="space-y-4 mb-12 grow text-sm font-bold">
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Blindagem Ratoeira Ads</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Ratoeira Pages Incluso</li>
              <li class="flex items-center gap-3 text-brand-dark"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Templates de Alta Conversão</li>
            </ul>"""

# Combo Ratazana Plus Vitalicio
old_combo_ratazana_plus_ul = """<ul class="space-y-4 mb-12 grow text-sm font-bold">
              <li class="flex items-center gap-3"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Ads Ilimitado</li>
              <li class="flex items-center gap-3"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Pages Ilimitadas</li>
              <li class="flex items-center gap-3"><svg class="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> Suporte Prioritário 24/7</li>
            </ul>"""

new_ads_ul = f'<ul class="space-y-4 mb-12 grow text-[13px] font-bold text-brand-dark/80">\n{build_li(ads_plus_items, "text-brand-dark")}\n            </ul>'
new_combo_ul = f'<ul class="space-y-4 mb-12 grow text-[13px] font-bold text-brand-dark/80">\n{build_li(combo_plus_items, "text-brand-dark")}\n            </ul>'
new_combo_plus_ul = f'<ul class="space-y-4 mb-12 grow text-[13px] font-bold text-white/80">\n{build_li(combo_plus_items, "text-white/90")}\n            </ul>'

text = text.replace(old_ads_ratazana_ul, new_ads_ul)
text = text.replace(old_ads_ratazana_plus_ul, new_ads_ul)
text = text.replace(old_combo_ratazana_ul, new_combo_ul)
text = text.replace(old_combo_ratazana_plus_ul, new_combo_plus_ul)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)
