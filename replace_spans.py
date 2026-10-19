import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

# Find all 3xl spans
standard_spans = re.findall(r'<span class="text-3xl text-brand-yellow my-6">R\$ \[VALOR\]</span>', text)
if len(standard_spans) == 18:
    bundles = ['ads', 'combo']
    periods = ['anual', 'semestral', 'mensal']
    plans = ['rato', 'ratazana', 'ratazana-plus']
    
    idx = 0
    for bundle in bundles:
        for period in periods:
            for plan in plans:
                replacement = f'<span class="text-3xl text-brand-yellow my-6" data-price-calc data-calc-bundle="{bundle}" data-calc-period="{period}" data-calc-plan="{plan}">R$ [VALOR]</span>'
                text = text.replace('<span class="text-3xl text-brand-yellow my-6">R$ [VALOR]</span>', replacement, 1)
                idx += 1

# Vitalício spans
vitalicio_spans = re.findall(r'<span class="text-6xl font-black text-brand-yellow tracking-tighter">R\$ \[VALOR\]</span>', text)
if len(vitalicio_spans) == 4:
    # 0 -> ads Ratazana
    # 1 -> ads Ratazana Plus
    # 2 -> combo Ratazana
    # 3 -> combo Ratazana Plus
    # They will both get the same price schedule since there's only one.
    v_replacements = [
        '<span class="text-6xl font-black text-brand-yellow tracking-tighter" data-price-vitalicio data-calc-bundle="ads" data-calc-plan="ratazana">R$ [VALOR]</span>',
        '<span class="text-6xl font-black text-brand-yellow tracking-tighter" data-price-vitalicio data-calc-bundle="ads" data-calc-plan="ratazana-plus">R$ [VALOR]</span>',
        '<span class="text-6xl font-black text-brand-yellow tracking-tighter" data-price-vitalicio data-calc-bundle="combo" data-calc-plan="ratazana">R$ [VALOR]</span>',
        '<span class="text-6xl font-black text-brand-yellow tracking-tighter" data-price-vitalicio data-calc-bundle="combo" data-calc-plan="ratazana-plus">R$ [VALOR]</span>'
    ]
    for rep in v_replacements:
        text = text.replace('<span class="text-6xl font-black text-brand-yellow tracking-tighter">R$ [VALOR]</span>', rep, 1)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)

