"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo leva para implementar o CondHub?",
    answer: "Isso depende do volume de cadastro inicial. O produto atual ja permite montar blocos, andares, unidades, moradores, espacos, agenda e boletos diretamente no painel.",
  },
  {
    question: "Posso migrar meus dados de outro sistema?",
    answer: "Hoje a pagina mostra o que o sistema ja permite fazer no cadastro e na operacao do dia a dia. Ela nao promete um processo especifico de migracao.",
  },
  {
    question: "O sistema funciona em dispositivos moveis?",
    answer: "Sim. O sistema inclui painel no computador e app do morador com login, mapa, boletos, documentos, datas importantes, notificacoes e ocorrencias.",
  },
  {
    question: "Como funciona o suporte tecnico?",
    answer: "A landing foi ajustada para falar do conteudo do sistema. Por isso, ela nao faz promessas detalhadas sobre formatos de atendimento ou prazos de suporte.",
  },
  {
    question: "Quais areas do sistema ja existem?",
    answer: "Hoje o sistema ja cobre resumo geral, mapa de blocos e unidades, ocorrencias, agenda, boletos, espacos comuns, reservas e moradores.",
  },
  {
    question: "O CondHub atende a LGPD?",
    answer: "Existem materiais de seguranca no projeto, mas a landing evita transformar isso em promessa juridica absoluta. Aqui o foco fica no que o sistema oferece na pratica.",
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
            Respostas alinhadas ao que o produto realmente entrega hoje.
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
