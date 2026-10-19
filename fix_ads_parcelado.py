import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

# Define the data map
data = {
    'rato': {'mensal': ('1x', '167,00'), 'semestral': ('6x', '149,52'), 'anual': ('12x', '139,31')},
    'ratazana': {'mensal': ('1x', '247,00'), 'semestral': ('6x', '205,80'), 'anual': ('12x', '185,85')},
    'ratazana-plus': {'mensal': ('1x', '397,00'), 'semestral': ('6x', '349,50'), 'anual': ('12x', '333,08')}
}

def replacement(match):
    # match.group() looks like:
    # <span class="text-3xl text-brand-yellow my-6" data-price-calc data-calc-bundle="ads" data-calc-period="anual" data-calc-plan="rato">R$ [VALOR]</span>
    period = match.group(1)
    plan = match.group(2)
    
    if plan not in data or period not in data[plan]:
        return match.group(0)

    multiplier, val = data[plan][period]
    times_str = f"{multiplier} " if multiplier != '1x' else ""
    
    # We'll use a wrapping div instead of just the span
    # Notice we keep the data-calc span inside the "ou X à vista"
    # To maintain dark mode compatibility, we check if it is ratazana-plus anual (which is dark bg)
    # Wait, in Só Ads, is ratazana-plus anual dark? Lines 107 in view: `bg-white`!!
    # Ah! In Só Ads, all 9 cards are bg-white! Let me check lines:
    # 71: Rato Anual -> bg-white
    # 89: Ratazana Anual -> bg-white
    # 107: Ratazana Plus Anual -> bg-white
    # 127: Rato Semestral -> bg-white
    # 145: Ratazana Semestral -> bg-white
    # 163: Ratazana Plus Semestral -> bg-white
    # 181: Rato Mensal -> bg-white
    # 198: Ratazana Mensal -> bg-white
    # 215: Ratazana Plus Mensal -> bg-white
    
    # Excellent! All are bg-white. So text-brand-dark/something is perfectly safe.
    
    html = f'''
             <div class="my-6">
               <span class="text-[10px] font-black text-brand-dark/30 uppercase tracking-widest block mb-1">Parcelado</span>
               <span class="text-4xl text-brand-yellow font-black block leading-none mb-3">{times_str}R$ {val}</span>
               <div class="text-[11px] font-black text-brand-dark/60 bg-brand-yellow/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-wider">
                 ou <span data-price-calc data-calc-bundle="ads" data-calc-period="{period}" data-calc-plan="{plan}">R$ [VALOR]</span> à vista
               </div>
             </div>
'''
    return html.strip()

# We only target data-calc-bundle="ads"
pattern = r'<span class="text-3xl text-brand-yellow my-6"[^>]*data-calc-bundle="ads"[^>]*data-calc-period="([^"]+)"[^>]*data-calc-plan="([^"]+)">R\$ \[VALOR\]</span>'

text = re.sub(pattern, replacement, text)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)

