import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

const whatsappNumber = "5547992611819"

const plans = [
  {
    code: "INDIVIDUAL",
    name: "Individual",
    description: "Para um unico condominio",
    price: "79,99",
    period: "/mes",
    features: [
      "1 condominio",
      "Ate 100 unidades",
      "Ate 200 moradores",
      "Todas as funcionalidades",
      "Suporte por email",
    ],
    cta: "Comecar agora",
    highlighted: false,
  },
  {
    code: "STARTER",
    name: "Starter",
    description: "Para pequenas gestoras",
    price: "199,99",
    period: "/mes",
    features: [
      "Ate 3 condominios",
      "Ate 250 unidades no total",
      "Ate 500 moradores",
      "Todas as funcionalidades",
      "Suporte prioritario",
    ],
    cta: "Comecar agora",
    highlighted: false,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Para gestoras em crescimento",
    price: "499,99",
    period: "/mes",
    features: [
      "Ate 10 condominios",
      "Ate 1.000 unidades no total",
      "Ate 3.000 moradores",
      "Todas as funcionalidades",
      "Suporte prioritario",
      "Onboarding dedicado",
    ],
    cta: "Comecar agora",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "Para grandes operacoes",
    price: "Sob consulta",
    period: "",
    features: [
      "Condominios ilimitados",
      "Volume sob consulta",
      "Ate 20.000 moradores",
      "SLA garantido",
      "Suporte dedicado",
      "Integracoes customizadas",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Planos
          </p>
          <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Precos simples e transparentes
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho da sua operacao
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            1 mes gratis em todos os planos
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                plan.highlighted
                  ? "border-primary bg-card shadow-xl"
                  : "border-border/50 bg-card hover:border-border"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {plan.price === "Sob consulta" ? "" : "R$ "}
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={
                  plan.code === "ENTERPRISE"
                    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Ola, tenho interesse no plano ${plan.name} do CondHub`,
                      )}`
                    : "/signup"
                }
                target={plan.code === "ENTERPRISE" ? "_blank" : undefined}
                rel={plan.code === "ENTERPRISE" ? "noreferrer" : undefined}
                className={`group flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border bg-transparent text-foreground hover:bg-secondary"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
