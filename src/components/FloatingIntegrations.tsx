import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { Search, X } from 'lucide-react';

export interface IntegrationItem {
    id: string | number;
    name: string;
    details?: string;
    logo?: string;
}

interface FloatingIntegrationsProps {
    items: IntegrationItem[];
}

const searchKey = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '');

const floatingPositions = [
    { name: 'Hotmart', position: 'top-[6%] left-[7%] max-md:top-[5%] max-md:left-[6%]' },
    { name: 'Maxbounty', position: 'top-[8%] right-[8%] max-md:top-[5%] max-md:right-[6%]' },
    { name: 'Yampi', position: 'top-[22%] left-[14%] max-md:hidden' },
    { name: 'Kiwify', position: 'top-[21%] right-[14%] max-md:hidden' },
    { name: 'ClickBank', position: 'top-[39%] left-[5%] max-md:top-[18%] max-md:left-[2%]' },
    { name: 'Eduzz', position: 'top-[40%] right-[6%] max-md:top-[18%] max-md:right-[2%]' },
    { name: 'Monetizze', position: 'top-[66%] left-[12%] max-md:top-auto max-md:bottom-[22%] max-md:left-[4%]' },
    { name: 'CartPanda', position: 'top-[65%] right-[13%] max-md:top-auto max-md:bottom-[22%] max-md:right-[4%]' },
    { name: 'Digistore24', position: 'bottom-[7%] left-[7%] max-md:bottom-[5%] max-md:left-[8%]' },
    { name: 'PerfectPay', position: 'bottom-[7%] right-[8%] max-md:bottom-[5%] max-md:right-[8%]' },
    { name: 'Kirvano', position: 'top-[7%] left-[38%] max-md:hidden' },
    { name: 'Braip', position: 'top-[8%] right-[38%] max-md:hidden' },
    { name: 'MyLead', position: 'bottom-[7%] left-[37%] max-md:hidden' },
    { name: 'EverFlow', position: 'bottom-[8%] right-[37%] max-md:hidden' },
    { name: 'AppMax', position: 'top-[48%] left-[18%] max-md:hidden' },
    { name: 'Ticto', position: 'top-[49%] right-[19%] max-md:hidden' },
];

function FloatingLogo({ item, position, index }: { item: IntegrationItem; position: string; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 260, damping: 22 });
    const springY = useSpring(y, { stiffness: 260, damping: 22 });
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (reducedMotion) return;

        const repel = (event: PointerEvent) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;

            const dx = event.clientX - (rect.left + rect.width / 2);
            const dy = event.clientY - (rect.top + rect.height / 2);
            const distance = Math.hypot(dx, dy);
            const force = distance < 150 ? (1 - distance / 150) * 32 : 0;
            x.set(distance ? -(dx / distance) * force : 0);
            y.set(distance ? -(dy / distance) * force : 0);
        };

        window.addEventListener('pointermove', repel, { passive: true });
        return () => window.removeEventListener('pointermove', repel);
    }, [reducedMotion, x, y]);

    return (
        <motion.div ref={ref} style={{ x: springX, y: springY }} className={`absolute ${position}`} aria-hidden="true">
            <motion.div
                className="flex size-16 md:size-20 items-center justify-center rounded-2xl bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                animate={reducedMotion ? undefined : { x: [0, 5, 0, -5, 0], y: [0, -8, 0, 8, 0], rotate: [0, 3, 0, -3, 0] }}
                transition={{ duration: 5 + (index % 4), repeat: Infinity, ease: 'easeInOut' }}
            >
                {item.logo && <img src={item.logo} alt="" loading="lazy" className="size-full object-contain" />}
            </motion.div>
        </motion.div>
    );
}

export default function FloatingIntegrations({ items }: FloatingIntegrationsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selected, setSelected] = useState<IntegrationItem | null>(null);
    const floatingItems = floatingPositions.flatMap(({ name, position }, index) => {
        const item = items.find((platform) => platform.name === name);
        return item ? [{ item, position, index }] : [];
    });
    const query = searchKey(searchTerm);
    const matches = items
        .filter((item) => searchKey(item.name).includes(query))
        .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));

    return (
        <section id="integracoes" className="relative isolate flex min-h-[760px] scroll-mt-20 items-center justify-center overflow-hidden bg-white px-4 py-32 md:min-h-[720px]">
            <div className="absolute inset-0" aria-hidden="true">
                {floatingItems.map(({ item, position, index }) => (
                    <FloatingLogo key={item.id} item={item} position={position} index={index} />
                ))}
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                <h2 className="mb-6 text-3xl font-black uppercase leading-tight tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
                    CONECTA COM <span className="text-brand-yellow italic">TUDO</span> QUE VOCÊ JÁ USA
                </h2>
                <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-tight text-brand-dark lg:text-lg">110+ plataformas.</p>
                    <p className="text-sm font-semibold leading-relaxed text-gray-600">
                        <span className="block">Conexão em minutos. Zero retrabalho.</span>
                        <span className="block">Seus checkouts, plataformas de afiliados e redes conectados de uma vez.</span>
                    </p>
                </div>

                <div
                    className="relative mt-10 w-full max-w-md"
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) setShowDropdown(false);
                    }}
                >
                    <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-brand-dark" aria-hidden="true" />
                    <input
                        type="search"
                        role="combobox"
                        value={searchTerm}
                        placeholder="BUSCAR PLATAFORMA..."
                        aria-label="Buscar plataforma integrada"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                        aria-controls={showDropdown ? 'platform-search-results' : undefined}
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setSelected(null);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') setShowDropdown(false);
                        }}
                        className="w-full rounded-full border border-gray-200 bg-white py-4 pl-12 pr-12 text-sm font-bold uppercase tracking-wide text-brand-dark shadow-[0_8px_28px_rgba(0,0,0,0.1)] outline-none placeholder:text-gray-500 focus-visible:border-brand-yellow focus-visible:ring-2 focus-visible:ring-brand-yellow/30 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            aria-label="Limpar busca"
                            onClick={() => {
                                setSearchTerm('');
                                setSelected(null);
                                setShowDropdown(false);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-600 hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-brand-yellow"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    )}
                    {showDropdown && (
                        <div id="platform-search-results" className="absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-y-auto rounded-2xl bg-white p-2 text-left shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                            {matches.length > 0 ? matches.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setSelected(item);
                                        setSearchTerm(item.name);
                                        setShowDropdown(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-brand-dark hover:bg-brand-yellow/10 focus-visible:outline-2 focus-visible:outline-brand-yellow"
                                >
                                    {item.logo && <img src={item.logo} alt="" className="size-8 object-contain" />}
                                    {item.name}
                                </button>
                            )) : <p className="px-3 py-2 text-sm text-gray-600">Nenhuma plataforma encontrada.</p>}
                        </div>
                    )}
                </div>
                {selected && (
                    <div className="mt-5 flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-bold text-brand-dark">
                        {selected.logo && <img src={selected.logo} alt="" className="size-6 object-contain" />}
                        {selected.name}
                    </div>
                )}
            </div>
        </section>
    );
}
