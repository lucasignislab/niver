import { useState, useEffect, useRef, useCallback, useMemo } from 'react'; 
import { motion, useInView } from 'framer-motion'; 
import type { 
    LucideIcon
} from 'lucide-react'; 
import { 
    Search, 
    DeleteIcon,
    Globe
} from 'lucide-react'; 

// NOTE: Placeholder for your custom Input component 
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => ( 
    <input {...props} /> 
); 

// --- Core Data Interface --- 
export interface ChainItem { 
    id: string | number; // Unique ID 
    name: string; 
    icon?: LucideIcon; 
    /** A secondary string line for the item, e.g., a short description or a value. */ 
    details?: string; 
    logo?: string; // Optional image URL 
} 

// --- Internal Animated Type --- 
/** The specific type returned by getVisibleItems, extending the base ChainItem. */ 
type AnimatedChainItem = ChainItem & { 
    distanceFromCenter: number; 
    originalIndex: number; 
}; 

// --- Component Props Interfaces --- 

interface CarouselItemProps { 
    chain: AnimatedChainItem; 
    side: 'left' | 'right'; 
} 

interface ChainCarouselProps { 
    /** The list of items to display in the carousel. (REQUIRED) */ 
    items: ChainItem[]; 
    /** The speed of the auto-scroll rotation in milliseconds. */ 
    scrollSpeedMs?: number; 
    /** The number of carousel items visible at once (must be an odd number). */ 
    visibleItemCount?: number; 
    /** Custom class for the main container div. */ 
    className?: string; 
    /** Function to call when a chain is selected from the search dropdown. */ 
    onChainSelect?: (chainId: ChainItem['id'], chainName: string) => void; 
} 

// --- Helper Components --- 

/** A single item card for the carousel. */ 
const CarouselItemCard: React.FC<CarouselItemProps> = ({ chain, side }) => { 
    const { distanceFromCenter, id, name, details, logo, icon } = chain; 
    const FallbackIcon = icon ?? Globe;
    const distance = Math.abs(distanceFromCenter); 
    // Visual effects based on distance from the center (0) 
    const opacity = 1 - distance / 4; 
    const scale = 1 - distance * 0.1; 
    const yOffset = distanceFromCenter * 90; 
    const xOffset = side === 'left' ? -distance * 50 : distance * 50; 

    // Cores do projeto: Amarelo (#FFB800) para o lado direito, Laranja (#FF4D00) para o lado esquerdo
    const iconColor = side === 'right' ? '#FFB800' : '#FF4D00';

    const IconOrLogo = logo ? (
        <div
            className="w-12 h-12 rounded-full border bg-white shadow-lg p-1.5 flex items-center justify-center overflow-hidden"
            style={{ borderColor: iconColor }}
        >
            <img src={logo} alt={`${name} logo`} className="w-full h-full object-contain rounded-full" />
        </div>
    ) : (
        <div
            className="rounded-full border border-muted-foreground/60 dark:border-muted-foreground/40 p-2 bg-foreground shadow-lg"
            style={{ borderColor: iconColor }}
        >
            <FallbackIcon className="size-8 text-background" style={{ color: iconColor }} />
        </div>
    ); 

    return ( 
        <motion.div 
            key={id} 
            className={`absolute flex items-center gap-4 text-background px-6 py-3 
                ${side === 'left' ? 'flex-row-reverse' : 'flex-row'}`} 
            animate={{ 
                opacity, 
                scale, 
                y: yOffset, 
                x: xOffset, 
            }} 
            transition={{ duration: 0.4, ease: 'easeInOut' }} 
        > 
            {IconOrLogo} 

            <div className={`flex flex-col mx-4 ${side === 'left' ? 'text-right' : 'text-left'}`}> 
                <span className="text-md lg:text-lg font-black text-brand-dark whitespace-nowrap uppercase tracking-tighter">{name}</span> 
                <span className="text-xs lg:text-sm text-gray-400 font-bold uppercase tracking-widest">{details}</span> 
            </div> 
        </motion.div> 
    ); 
}; 

// --- Main Component --- 

const ChainCarousel: React.FC<ChainCarouselProps> = ({ 
    items, 

    scrollSpeedMs = 1500, 
    visibleItemCount = 9, 
    className = '', 
    onChainSelect, 
}) => { 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [isPaused, setIsPaused] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [showDropdown, setShowDropdown] = useState(false); 

    // References for Framer Motion scroll-based animation 
    const rightSectionRef = useRef<HTMLDivElement>(null); 
    const isInView = useInView(rightSectionRef, { margin: '-100px 0px -100px 0px' }); 
    const totalItems = items.length; 

    // 1. Auto-scroll effect 
    useEffect(() => { 
        if (isPaused || totalItems === 0) return; 

        const interval = setInterval(() => { 
            setCurrentIndex((prev) => (prev + 1) % totalItems); 
        }, scrollSpeedMs); 

        return () => clearInterval(interval); 
    }, [isPaused, totalItems, scrollSpeedMs]); 

    // 2. Scroll listener to pause carousel on page scroll 
    useEffect(() => { 
        let timeoutId: any; 
        const handleScroll = () => { 
            setIsPaused(true); 
            clearTimeout(timeoutId); 
            timeoutId = setTimeout(() => { 
                setIsPaused(false); 
            }, 500); // Resume auto-scroll after 500ms of no scrolling 
        }; 

        window.addEventListener('scroll', handleScroll, { passive: true }); 
        return () => { 
            window.removeEventListener('scroll', handleScroll); 
            clearTimeout(timeoutId); 
        }; 
    }, []); 


    // Memoized function for carousel items 
    const getVisibleItems = useCallback( 
        (): AnimatedChainItem[] => { // Explicitly define return type 
            const visibleItems: AnimatedChainItem[] = []; 
            if (totalItems === 0) return []; 

            // Ensure visibleItemCount is an odd number for a clear center item 
            const itemsToShow = visibleItemCount % 2 === 0 ? visibleItemCount + 1 : visibleItemCount; 
            const half = Math.floor(itemsToShow / 2); 

            for (let i = -half; i <= half; i++) { 
                let index = currentIndex + i; 
                if (index < 0) index += totalItems; 
                if (index >= totalItems) index -= totalItems; 

                visibleItems.push({ 
                    ...items[index], 
                    originalIndex: index, 
                    distanceFromCenter: i, 
                }); 
            } 
            return visibleItems; 
        }, 
        [currentIndex, items, totalItems, visibleItemCount] 
    ); 

    // Filtered list for search dropdown 
    const filteredItems = useMemo(() => { 
        return items.filter((item) => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        ); 
    }, [items, searchTerm]); 

    // Handler for selecting an item from the dropdown 
    const handleSelectChain = (id: ChainItem['id'], name: string) => { 
        const index = items.findIndex((c) => c.id === id); 
        if (index !== -1) { 
            setCurrentIndex(index); // Jump to the selected item 
            setIsPaused(true);       // Pause to highlight the selection 
        } 
        setSearchTerm(name); // Set search term to the selected item's name 
        setShowDropdown(false); 
    }; 

    // The current item displayed in the center 
    const currentItem = items[currentIndex]; 
    const CurrentItemIcon = currentItem?.icon ?? Globe;

    // --- JSX Render --- 
    return ( 
        <div id='integracoes' className={`py-24 bg-white overflow-hidden space-y-20 ${className}`}> 
            <div className='flex flex-col xl:flex-row max-w-7xl mx-auto px-4 md:px-8 gap-12 justify-center items-center'> 
 
                {/* Left Section - Chain Carousel (Orange) */} 
                <motion.div 
                    className="relative w-full max-w-md xl:max-w-2xl h-[450px] flex items-center justify-center hidden xl:flex -left-14" 
                    onMouseEnter={() => !searchTerm && setIsPaused(true)} 
                    onMouseLeave={() => !searchTerm && setIsPaused(false)} 
                    initial={{ x: '-100%', opacity: 0 }} 
                    animate={isInView ? { x: 0, opacity: 1 } : {}} 
                    transition={{ type: 'spring', stiffness: 80, damping: 20, duration: 0.8 }} 
                > 
                    <div className="absolute inset-0 z-10 pointer-events-none"> 
                        <div className="absolute top-0 h-1/4 w-full bg-gradient-to-b from-white to-transparent"></div> 
                        <div className="absolute bottom-0 h-1/4 w-full bg-gradient-to-t from-white to-transparent"></div> 
                    </div> 
 
                    {getVisibleItems().map((chain) => ( 
                        <CarouselItemCard 
                            key={`left-${chain.id}-${chain.originalIndex}`} 
                            chain={chain} 
                            side="left" 
                        /> 
                    ))} 
                </motion.div> 
 
                {/* Middle Section - Text and Search Input */} 
                <div className="flex flex-col text-center gap-4 w-full max-w-3xl xl:max-w-4xl mx-auto z-20"> 
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-2 leading-tight">
                        CONECTA COM <span className="text-brand-yellow italic">TUDO</span> QUE VOCÊ JÁ USA
                    </h2>
                    <div className="space-y-2 mb-6">
                        <p className="text-sm lg:text-lg text-brand-dark font-black uppercase tracking-tight">
                            Mais de 70 plataformas.
                        </p>
                        <p className="text-[11px] lg:text-sm text-gray-500 font-semibold tracking-normal leading-relaxed">
                            <span className="block">Conexão em minutos. Zero retrabalho.</span>
                            <span className="block">Seus checkouts, plataformas de afiliados e redes conectados de uma vez.</span>
                        </p>
                    </div>

                    {/* Currently Selected Item Display */} 
                    {currentItem && ( 
                        <div className="flex flex-col items-center justify-center mt-4"> 
                            <div className='p-3 bg-white rounded-full shadow-lg'> 
                                {currentItem.logo ? ( 
                                    <img src={currentItem.logo} alt={`${currentItem.name} logo`} className="size-16 object-contain rounded-full" /> 
                                ) : ( 
                                    <CurrentItemIcon className="size-16 text-brand-yellow" /> 
                                )} 
                            </div> 
                        </div> 
                    )} 
 
                    {/* Search Bar */} 
                    <div className="mt-8 relative max-w-lg mx-auto w-full"> 
                        <div className="flex items-center relative"> 
                            <Input 
                                type="text" 
                                value={searchTerm} 
                                placeholder="BUSCAR PLATAFORMA..." 
                                onChange={(e) => { 
                                    const val = e.target.value; 
                                    setSearchTerm(val); 
                                    setShowDropdown(val.length > 0); 
                                    if (val === '') setIsPaused(false); 
                                }} 
                                onFocus={() => { 
                                    if (searchTerm.length > 0) setShowDropdown(true); 
                                    setIsPaused(true); 
                                }} 
                                onBlur={() => { 
                                    setTimeout(() => setShowDropdown(false), 200); 
                                }} 
                                className="w-full outline-none text-brand-dark bg-white px-6 py-4 placeholder-gray-300 text-sm font-black rounded-full border-2 border-gray-100 pr-12 pl-12 focus:border-brand-yellow transition-all uppercase tracking-widest shadow-lg" 
                            /> 
                            <Search className="absolute text-brand-dark w-5 h-5 left-4 pointer-events-none" /> 
                            {searchTerm && ( 
                                <button 
                                    onClick={() => { 
                                        setSearchTerm(''); 
                                        setShowDropdown(false); 
                                        setIsPaused(false); 
                                    }} 
                                    className="absolute right-4 text-brand-dark hover:text-red-500 transition-colors" 
                                > 
                                    <DeleteIcon size={20} /> 
                                </button> 
                            )} 
                        </div> 
 
                        {/* Dropdown for search results */} 
                        {showDropdown && filteredItems.length > 0 && ( 
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-gray-100 z-30 max-h-60 overflow-y-auto shadow-2xl p-2"> 
                                {filteredItems.slice(0, 10).map((chain) => { 
                                    const DropdownIcon = chain.icon ?? Globe;
                                    return (
                                    <div
                                        key={chain.id} 
                                        onMouseDown={(e) => { 
                                            e.preventDefault(); 
                                            handleSelectChain(chain.id, chain.name); 
                                        }} 
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-yellow/10 transition-colors duration-150 rounded-xl" 
                                    > 
                                        {chain.logo ? ( 
                                            <img src={chain.logo} alt={`${chain.name} logo`} className="size-8 rounded-full object-cover" /> 
                                        ) : ( 
                                            <DropdownIcon size={24} className="text-brand-yellow" /> 
                                        )} 
                                        <span className="text-brand-dark font-black text-xs uppercase tracking-tighter">{chain.name}</span> 
                                        <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest">{chain.details}</span> 
                                    </div> 
                                    );
                                })} 
                            </div> 
                        )} 
                    </div>

                    {/* Mobile only: marquee infinito de logos */}
                    <div className="xl:hidden w-full overflow-hidden mt-6">
                        <style>{`
                            @keyframes marquee-left {
                                0%   { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            .marquee-track-l { animation: marquee-left 70s linear infinite; }
                        `}</style>

                        <div className="relative flex overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                            <div className="flex gap-3 marquee-track-l">
                                {[...items, ...items].map((item, i) => (
                                    <div key={`ml-${i}`} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-2 shrink-0">
                                        {item.logo
                                            ? <img src={item.logo} alt={item.name} className="w-6 h-6 rounded-full object-contain" />
                                            : <Globe className="w-5 h-5 text-brand-yellow" />
                                        }
                                        <span className="text-[11px] font-black text-brand-dark uppercase tracking-tight whitespace-nowrap">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
 
                {/* Right Section - Chain Carousel (Yellow) */} 
                <motion.div 
                    ref={rightSectionRef} 
                    className="hidden xl:flex relative w-full max-w-md xl:max-w-2xl h-[450px] items-center justify-center -right-14" 
                    onMouseEnter={() => !searchTerm && setIsPaused(true)} 
                    onMouseLeave={() => !searchTerm && setIsPaused(false)} 
                    initial={{ x: '100%', opacity: 0 }} 
                    animate={isInView ? { x: 0, opacity: 1 } : {}} 
                    transition={{ type: 'spring', stiffness: 80, damping: 20, duration: 0.8 }} 
                > 
                    <div className="absolute inset-0 z-10 pointer-events-none"> 
                        <div className="absolute top-0 h-1/4 w-full bg-gradient-to-b from-white to-transparent"></div> 
                        <div className="absolute bottom-0 h-1/4 w-full bg-gradient-to-t from-white to-transparent"></div> 
                    </div> 
 
                    {getVisibleItems().map((chain) => ( 
                        <CarouselItemCard 
                            key={`right-${chain.id}-${chain.originalIndex}`} 
                            chain={chain} 
                            side="right" 
                        /> 
                    ))} 
                </motion.div> 
            </div>

        </div> 
    ); 
}; 
 
export default ChainCarousel; 
