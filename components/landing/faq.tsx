"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo leva para implementar o CondoHome?",
    answer: "A implementacao basica pode ser feita em menos de 1 hora. Para migracoes completas com historico de dados, nossa equipe de sucesso do cliente acompanha todo o processo, que geralmente leva de 3 a 5 dias uteis.",
  },
  {
    question: "Posso migrar meus dados de outro sistema?",
    answer: "Sim! Oferecemos migracao gratuita de dados dos principais sistemas do mercado. Nossa equipe cuida de todo o processo para garantir que nenhuma informacao seja perdida.",
  },
  {
    question: "O sistema funciona em dispositivos moveis?",
    answer: "Sim, o CondoHome e totalmente responsivo e funciona em qualquer dispositivo. Alem disso, oferecemos aplicativos nativos para iOS e Android nos planos Profissional e Enterprise.",
  },
  {
    question: "Como funciona o suporte tecnico?",
    answer: "Oferecemos suporte por email no plano Starter, suporte prioritario por chat e telefone no plano Profissional, e gerente de conta dedicado no plano Enterprise. Nosso tempo medio de resposta e de menos de 2 horas.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, nao temos fidelidade. Voce pode cancelar sua assinatura a qualquer momento sem multas. Seus dados ficam disponiveis para exportacao por 30 dias apos o cancelamento.",
  },
  {
    question: "O CondoHome atende a LGPD?",
    answer: "Absolutamente. O CondoHome foi desenvolvido em conformidade com a LGPD. Todos os dados sao criptografados, armazenados em servidores no Brasil e voce tem controle total sobre as informacoes dos moradores.",
  },
]

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tudo que voce precisa saber sobre o CondoHome.
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
