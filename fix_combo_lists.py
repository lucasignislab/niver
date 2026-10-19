import re

with open('src/components/Pricing.astro', 'r') as f:
    text = f.read()

# For Combo Ratazana Plus Semestral
pattern_semestral = r'(<h3 class="text-lg text-brand-dark">Combo Ratazana Plus <span class="text-\[10px\] block opacity-40 uppercase mt-1">Semestral</span></h3>\s*<span class="text-3xl text-brand-yellow my-6"[^>]+>.*?</span>\s*<ul class="space-y-3 mb-8 grow text-\[13px\] font-bold )text-white/70( text-left">)'
text = re.sub(pattern_semestral, r'\1text-brand-dark/70\2', text, flags=re.DOTALL)

# For Combo Ratazana Plus Mensal
pattern_mensal = r'(<h3 class="text-lg text-brand-dark">Combo Ratazana Plus <span class="text-\[10px\] block opacity-40 uppercase mt-1">Mensal</span></h3>\s*<span class="text-3xl text-brand-yellow my-6"[^>]+>.*?</span>\s*<ul class="space-y-3 mb-8 grow text-\[13px\] font-bold )text-white/70( text-left">)'
text = re.sub(pattern_mensal, r'\1text-brand-dark/70\2', text, flags=re.DOTALL)

with open('src/components/Pricing.astro', 'w') as f:
    f.write(text)
