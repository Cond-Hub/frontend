"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo leva para comecar a usar o CondHub?",
    answer: "Voce pode comecar a usar o sistema imediatamente apos criar sua conta. O cadastro de blocos, unidades e moradores pode ser feito gradualmente ou importado via planilha em minutos.",
  },
  {
    question: "Posso migrar dados de outro sistema?",
    answer: "Sim, oferecemos suporte completo para migracao de dados. Nossa equipe avalia o formato dos seus dados e realiza a importacao sem custo adicional nos planos Pro e Enterprise.",
  },
  {
    question: "O sistema funciona em dispositivos moveis?",
    answer: "Sim. Os moradores acessam pelo aplicativo disponivel na Play Store. Gestores e sindicos podem usar tanto o app de gestao quanto o painel web responsivo em qualquer dispositivo.",
  },
  {
    question: "Como funciona o periodo gratuito?",
    answer: "Todos os planos incluem 1 mes de uso gratuito sem compromisso. Nao pedimos cartao de credito para comecar. Apos o periodo, voce escolhe se deseja continuar.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim, voce pode fazer upgrade ou downgrade do seu plano a qualquer momento pelo painel. As mudancas sao aplicadas proporcionalmente no proximo ciclo de cobranca.",
  },
  {
    question: "O CondHub esta em conformidade com a LGPD?",
    answer: "Sim, seguimos as melhores praticas de protecao de dados e estamos em total conformidade com a LGPD. Utilizamos criptografia de ponta e servidores seguros para proteger todas as informacoes.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Oferecemos suporte via email, chat e WhatsApp. Nos planos Pro e Enterprise, voce tem acesso a suporte prioritario com tempo de resposta garantido e atendimento dedicado.",
  },
]

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-foreground">Perguntas</span>{" "}
            <span className="gradient-text">frequentes</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Tire suas duvidas sobre o CondHub
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen 
                      ? "border-primary/30 bg-card/80 shadow-lg shadow-black/20" 
                      : "border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/50"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-6 text-left"
                  >
                    <span className={`text-lg font-medium transition-colors ${
                      isOpen ? "text-foreground" : "text-foreground/80"
                    }`}>
                      {faq.question}
                    </span>
                    <motion.div 
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                        isOpen 
                          ? "bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      }`}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-base leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
