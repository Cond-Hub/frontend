"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo leva para comecar a usar o CondHub?",
    answer: "Voce pode comecar a usar o sistema imediatamente apos criar sua conta. O cadastro de blocos, unidades e moradores pode ser feito gradualmente conforme sua necessidade.",
  },
  {
    question: "Posso migrar dados de outro sistema?",
    answer: "Sim, oferecemos suporte para migracao de dados. Entre em contato conosco para avaliarmos o formato dos seus dados e definirmos a melhor estrategia de importacao.",
  },
  {
    question: "O sistema funciona em dispositivos moveis?",
    answer: "Sim. Os moradores acessam pelo aplicativo disponivel na Play Store. Gestores e sindicos podem usar tanto o app de gestao quanto o painel web em qualquer dispositivo.",
  },
  {
    question: "Como funciona o periodo gratuito?",
    answer: "Todos os planos incluem 1 mes de uso gratuito sem compromisso. Nao pedimos cartao de credito para comecar. Apos o periodo, voce escolhe se deseja continuar.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim, voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudancas sao aplicadas proporcionalmente no proximo ciclo de cobranca.",
  },
  {
    question: "O CondHub esta em conformidade com a LGPD?",
    answer: "Sim, seguimos as melhores praticas de protecao de dados e estamos em conformidade com a Lei Geral de Protecao de Dados. Seus dados e os dados dos moradores estao seguros.",
  },
]

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Tire suas duvidas sobre o CondHub
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                  isOpen 
                    ? "border-primary/30 bg-card shadow-sm" 
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className={`font-medium transition-colors ${
                    isOpen ? "text-foreground" : "text-foreground/80"
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
