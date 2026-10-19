"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShieldCheck } from 'lucide-react';

const faqs = [
  {
    question: "1. O que exatamente a Ratoeira ADS bloqueia?",
    answer: "Nossa tecnologia identifica e bloqueia cliques de fazendas de bots, robôs de espionagem, proxies maliciosos e concorrentes que clonam suas campanhas, economizando seu orçamento diretamente no Google Ads."
  },
  {
    question: "2. Tem garantia de satisfação?",
    answer: "Sim. Você tem 7 dias de garantia incondicional. Se não ver o controle que a ferramenta entrega, devolvemos 100% do valor da assinatura, sem burocracia."
  },
  {
    question: "3. Posso usar em qualquer construtor de páginas?",
    answer: "Sim. A Ratoeira ADS integra super fácil via scripts. Você pode colocar em WordPress, Elementor, ClickFunnels, Astro ou qualquer página HTML."
  },
  {
    question: "4. Como funciona a assinatura Vitalícia?",
    answer: "Na oferta de aniversário, você garante o acesso vitalício pagando apenas uma vez. Isso significa que você terá a Ratoeira ativa para sempre, sem nenhuma cobrança recorrente mensal ou anual."
  },
  {
    question: "5. A plataforma atualiza as ferramentas e proteções?",
    answer: "Constantemente. Nossa base de dados de IPs fraudulentos e robôs maliciosos é atualizada em tempo real para garantir que as suas campanhas estejam sempre protegidas contra as mais recentes ameaças do mercado."
  },
  {
    question: "6. O que é a Ratoeira Pages e para quem ela é indicada?",
    answer: "A Ratoeira Pages é um construtor de páginas focado em altíssima velocidade e conversão. É a ferramenta ideal para profissionais do marketing digital, infoprodutores, afiliados e gestores de tráfego que precisam colocar landing pages, páginas de vendas e presells no ar rapidamente, sem depender de programadores ou designers."
  },
  {
    question: "7. Preciso saber programação ou ter experiência com design?",
    answer: "Não. A plataforma conta com um construtor visual 100% intuitivo no estilo \"arraste e solte\" (drag-and-drop). Você pode escolher um dos nossos Templates Prontos ou Flash Pages e apenas substituir os textos e imagens para deixar a página com a identidade da sua marca."
  },
  {
    question: "8. O que são as Flash Pages?",
    answer: "As Flash Pages são modelos de páginas pré-configurados e focados em altíssima conversão, desenhados para quando o tempo é seu fator mais crítico. São perfeitas para validação rápida de ofertas, testes A/B e lançamentos relâmpagos, permitindo que você publique uma página em poucos minutos."
  },
  {
    question: "9. As páginas funcionam bem no celular?",
    answer: "Sim. Todas as páginas criadas na Ratoeira Pages já nascem com a arquitetura mobile-first. Elas são 100% responsivas, garantindo um carregamento ultrarrápido e uma experiência de navegação perfeita tanto em smartphones quanto em desktops."
  },
  {
    question: "10. Como funciona a integração com o Ratoeira Ads?",
    answer: "A integração é feita com poucos cliques e dispensa o uso de códigos complexos. Ao conectar o Ratoeira Pages ao Ratoeira Ads, você ativa um rastreamento inteligente e de altíssima precisão. O sistema consegue capturar dados de bots e até de visitantes rápidos que saem antes do carregamento completo, garantindo que você nunca perca dados cruciais para o seu ROI."
  },
  {
    question: "11. Posso usar a ferramenta para tráfego vindo de redes sociais (Social Commerce)?",
    answer: "Absolutamente. A plataforma é impulsionada por IA para criar uma transição perfeita e sem atritos entre o anúncio (no feed) e a página de destino (checkout). O foco é reter a atenção do usuário com carregamento rápido e design voltado para maximizar cada clique."
  },
  {
    question: "12. Eu tenho alguma garantia ao assinar a Ratoeira Pages?",
    answer: "Sim. Você conta com 7 dias de garantia incondicional. Você pode assinar, acessar os templates, testar o construtor visual e a integração de rastreamento. Se não se adaptar à plataforma, seu investimento é devolvido."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#0F0F11] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
            Perguntas <span className="text-brand-yellow">Frequentes</span>
          </h2>
          <p className="text-white/60 text-lg">
            FAQ completo da Ratoeira ADS + Ratoeira Pages em um só lugar.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen 
                    ? 'bg-white/10 border-brand-yellow/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg md:text-xl pr-8 transition-colors duration-300 ${isOpen ? 'text-brand-yellow' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isOpen ? 'bg-brand-yellow text-brand-dark' : 'bg-white/10 text-white'
                  }`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="p-6 md:p-8 pt-0 text-white/60 leading-relaxed text-base md:text-lg">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Garantia CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-gradient-to-r from-brand-yellow/10 to-[#1A1A1C] border border-brand-yellow/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_30px_rgba(255,184,0,0.05)]"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center flex-shrink-0 text-brand-dark shadow-xl">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                Risco Zero: <span className="text-brand-yellow">7 Dias de Garantia</span>
              </h3>
              <p className="text-white/60 text-sm md:text-base">
                Assine hoje com o super desconto de aniversário e teste sem medos.
              </p>
            </div>
          </div>
          <a 
            href="#planos" 
            className="whitespace-nowrap flex items-center justify-center gap-3 bg-brand-yellow text-brand-dark font-black px-10 py-5 rounded-full hover:bg-[#FFD54A] hover:shadow-[0_0_30px_rgba(255,184,0,0.3)] hover:-translate-y-1 transition-all duration-300 uppercase text-lg tracking-tight shadow-xl w-full md:w-auto"
          >
            Garantir Oferta
          </a>
        </motion.div>
      </div>
    </section>
  );
}
