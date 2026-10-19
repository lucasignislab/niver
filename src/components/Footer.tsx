"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-brand-dark relative h-fit rounded-[3rem] overflow-hidden m-4 md:m-8 text-white/70">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-4 md:px-14 md:pt-14 md:pb-6 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          
          {/* Section: Ratoeira ADS */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
                <img src="/logoraads2.png" alt="Logo Ratoeira ADS" className="w-full h-full object-contain" />
              </div>
              <span className="text-white text-2xl font-black tracking-tight">Ratoeira <span className="text-brand-yellow">ADS</span></span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Rastreamento real, proteção anti-fraude e dashboard completo para afiliados profissionais do Google Ads.
            </p>
            <div className="space-y-3 pt-2">
               <h4 className="text-white text-sm font-black uppercase tracking-widest">Produto</h4>
               <ul className="space-y-2 text-sm font-bold">
                 <li><a href="#como-funciona" className="hover:text-brand-yellow transition-colors">Funcionalidades</a></li>
                 <li><a href="#integracoes" className="hover:text-brand-yellow transition-colors">Integrações</a></li>
                 <li><a href="#planos" className="hover:text-brand-yellow transition-colors">Preços</a></li>
               </ul>
            </div>
          </div>

          {/* Section: Ratoeira PAGES */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
                <img src="/logopages2.png" alt="Logo Ratoeira PAGES" className="w-full h-full object-contain" />
              </div>
              <span className="text-white text-2xl font-black tracking-tight">Ratoeira <span className="text-orange-500">PAGES</span></span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Domine o mercado digital com páginas de alta conversão. Estrutura própria em segundos.
            </p>
            <div className="space-y-3 pt-2">
               <h4 className="text-white text-sm font-black uppercase tracking-widest">Links Úteis</h4>
               <ul className="space-y-2 text-sm font-bold">
                 <li><a href="/termos-de-uso-ratoeira-ads" className="hover:text-orange-500 transition-colors">Termos de Uso ADS</a></li>
                 <li><a href="/termos-de-uso-ratoeira-pages" className="hover:text-orange-500 transition-colors">Termos de Uso PAGES</a></li>
                 <li><a href="/termos-de-uso-ratoeira-combo-ads-pages" className="hover:text-orange-500 transition-colors">Termos de Uso COMBO</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Política de Privacidade</a></li>
               </ul>
            </div>
          </div>

          {/* Section: Suporte & Contato */}
          <div className="lg:col-span-1">
            <h4 className="text-white text-lg font-black mb-6 uppercase tracking-widest">Suporte</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-brand-yellow shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+5519997278153" className="hover:text-brand-yellow transition-colors font-bold">(19) 99727-8153</a>
                  <span className="text-[10px] uppercase opacity-50 font-black">WhatsApp & Central de Ajuda</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-yellow shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Alameda Rio Negro, 503</span>
                  <span className="text-xs opacity-60">Sala 2020, Alphaville - Barueri/SP</span>
                  <span className="text-xs opacity-60">06454-000</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Section: Informações Legais */}
          <div>
            <h4 className="text-white text-lg font-black mb-6 uppercase tracking-widest">Legal</h4>
            <div className="space-y-6 text-[11px] leading-relaxed opacity-60">
              <div>
                <p className="font-black text-white/80 uppercase mb-1">Ratoeira ADS</p>
                <p>Digital Marketing - 55.824.986/0001-06</p>
              </div>
              <div>
                <p className="font-black text-white/80 uppercase mb-1">Ratoeira PAGES</p>
                <p>Digital Marketing LTDA - 62.829.447/0001-25</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 opacity-60 font-bold mt-4 mb-4">
          <div className="flex space-x-6">
            <a href="#" className="hover:text-brand-yellow transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-brand-yellow transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-brand-yellow transition-colors"><Twitter size={20} /></a>
          </div>
          <p className="text-center md:text-right">
            &copy; {new Date().getFullYear()} Ratoeira Group. Todos os direitos reservados.
          </p>
        </div>

        <hr className="border-t border-white/10" />
      </div>
    </footer>
  );
}

export default Footer;
