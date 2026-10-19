import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

def generate_list(items, is_dark=False):
    text_color = "text-white/70" if is_dark else "text-brand-dark/70"
    html = f'\n            <ul class="space-y-3 mb-8 grow text-[13px] font-bold {text_color} text-left">\n'
    for item in items:
        html += f'              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">{item}</span></li>\n'
    html += '            </ul>'
    return html

rato_items = [
    "E-Book de Estratégia Mensal",
    "50 Produtos Rastreados",
    "5 com Conversão Automática",
    "Integrações Ilimitadas",
    "3 Perfis Google Ads Conectados",
    "5 Links de Produtor Automáticos",
    "Hospedagem Grátis",
    "1 domínio conectado",
    "5.000 Acessos mensais",
    "Páginas ilimitadas",
    "Tutorial Passo a Passo",
    "Suporte Via WhatsApp",
    "Domínio Customizado"
]

ratazana_items = [
    "E-Book de Estratégia Mensal",
    "100 Ratoeiras (Simultâneos)",
    "50 Ratoeiras Automáticas",
    "Plataformas Ilimitadas",
    "10 Perfis do Google Conectados",
    "50 URLs de Produtor Automáticas",
    "Hospedagem Grátis",
    "5 domínios conectados",
    "200.000 Acessos mensais",
    "Páginas ilimitadas",
    "Tutorial Passo a Passo",
    "Suporte Via WhatsApp",
    "Domínio Customizado"
]

ratazana_plus_items = [
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

combo_rato_html = generate_list(rato_items, False)
combo_ratazana_html = generate_list(ratazana_items, False)
combo_ratazana_plus_html = generate_list(ratazana_plus_items, True)

def insert_list_after_span(text, plan_name, list_html):
    # we need to target <span class="..." data-calc-bundle="combo" ... data-calc-plan="{plan}">R$ [VALOR]</span>
    pattern = r'(<span class="text-3xl text-brand-yellow my-6" data-price-calc data-calc-bundle="combo" data-calc-period="(anual|semestral|mensal)" data-calc-plan="' + plan_name + r'">R\$ \[VALOR\]</span>)'
    return re.sub(pattern, r'\1' + list_html, text)

text = insert_list_after_span(text, 'rato', combo_rato_html)
text = insert_list_after_span(text, 'ratazana', combo_ratazana_html)
text = insert_list_after_span(text, 'ratazana-plus', combo_ratazana_plus_html)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)

