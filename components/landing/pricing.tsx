import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    description: "Ideal para condominios pequenos",
    price: "199",
    period: "/mes",
    features: [
      "Ate 50 unidades",
      "Gestao financeira basica",
      "Portal do morador",
      "Reservas de areas comuns",
      "Suporte por email",
    ],
    cta: "Comece Gratis",
    highlighted: false,
  },
  {
    name: "Profissional",
    description: "Para condominios em crescimento",
    price: "399",
    period: "/mes",
    features: [
      "Ate 200 unidades",
      "Gestao financeira completa",
      "Portal do morador + App",
      "Reservas + Controle de acesso",
      "Relatorios avancados",
      "Suporte prioritario",
      "Integracao bancaria",
    ],
    cta: "Escolher Plano",
    highlighted: true,
    badge: "Mais Popular",
  },
  {
    name: "Enterprise",
    description: "Para administradoras",
    price: "Custom",
    period: "",
    features: [
      "Unidades ilimitadas",
      "Multi-condominio",
      "API completa",
      "White-label disponivel",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Integracao personalizada",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
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
            Comece gratis por 14 dias. Sem necessidade de cartao de credito.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
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
              <Link href="/login">
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
