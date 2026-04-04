import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const whatsappNumber = "5547992611819"

const plans = [
  {
    name: "Essencial",
    description: "Ideal para centralizar a operacao do condominio",
    price: "149",
    period: "/mes",
    features: [
      "Visao geral e analytics",
      "Gestao de unidades e blocos",
      "Gestao de ocorrencias e chamados",
      "Calendario e agendamentos",
      "Boletos",
      "Sistema de reserva de amenidades",
      "Gestao de moradores",
    ],
    cta: "Escolher plano",
    highlighted: false,
  },
  {
    name: "Completo",
    description: "Para condominios que tambem querem receber pelo app",
    price: "199",
    period: "/mes",
    features: [
      "Tudo do primeiro plano",
      "Pagamentos com PIX imediatos",
      "Notificacoes automaticas para moradores pelo app",
      "Taxa operacional de R$ 1,99 por recebimento via PIX",
      "Saques gratis e ilimitados",
    ],
    cta: "Escolher plano",
    highlighted: true,
    badge: "Mais escolhido",
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="border-y border-border bg-muted/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Planos</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Escolha o plano ideal para seu condominio
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dois planos objetivos para operar o condominio e, se quiser, receber com PIX.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border bg-card"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price === "Custom" ? "" : "R$ "}
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Olá, tenho interesse no plano ${plan.name} da ContHub`,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
