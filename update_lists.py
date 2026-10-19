import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

rato_list = """
            <ul class="space-y-3 mb-8 grow text-[13px] font-bold text-brand-dark/70 text-left">
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">E-Book de Estratégia Mensal</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">50 Produtos Rastreados Simultaneamente</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">5 com Conversão 100% Automática</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">Integrações com Plataformas Ilimitadas</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">3 Perfis Google Ads Conectados</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">5 Links de Produtor Automáticos</span></li>
            </ul>"""

ratazana_list = """
            <ul class="space-y-3 mb-8 grow text-[13px] font-bold text-brand-dark/70 text-left">
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">E-Book de Estratégia Mensal</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">100 Ratoeiras (Produtos Simultâneos)</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">50 Ratoeiras com Conversão Automática</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">Plataformas Conectadas Ilimitadas</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">10 Perfis do Google Conectados</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">50 URLs de Produtor Automáticas</span></li>
            </ul>"""

ratazana_plus_list = """
            <ul class="space-y-3 mb-8 grow text-[13px] font-bold text-brand-dark/70 text-left">
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">30 perfis de Google Conectados</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">150 ratoeiras automáticas</span></li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> <span class="leading-snug">Conta de anúncio ilimitadas</span></li>
            </ul>"""

def insert_list_after_span(text, plan_name, list_html):
    # we need to target <span class="..." data-calc-bundle="ads" ... data-calc-plan="{plan}">R$ [VALOR]</span>
    pattern = r'(<span class="text-3xl text-brand-yellow my-6" data-price-calc data-calc-bundle="ads" data-calc-period="(anual|semestral|mensal)" data-calc-plan="' + plan_name + r'">R\$ \[VALOR\]</span>)'
    # replace inserts the list after the match.
    return re.sub(pattern, r'\1\n' + list_html, text)

# For Vitalicio, it's already there! They have their own <ul>...</ul> but it's for `Plano Ratazana` and `Ratazana Plus`.
# I will only modify the anual, semestral, mensal (handled by the regex above).

text = insert_list_after_span(text, 'rato', rato_list)
text = insert_list_after_span(text, 'ratazana', ratazana_list)
text = insert_list_after_span(text, 'ratazana-plus', ratazana_plus_list)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)

