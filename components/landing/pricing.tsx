import Link from "next/link"
import { Check, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const whatsappNumber = "5547992611819"

const plans = [
  {
    code: "INDIVIDUAL",
    name: "Individual",
    description: "Para operar um unico condominio",
    price: "79,99",
    period: "/mes",
    features: [
      "1 condominio incluso",
      "Ate 100 unidades",
      "Ate 200 moradores",
      "Todas as features",
      "Suporte padrao",
    ],
    cta: "Escolher plano",
    highlighted: false,
  },
  {
    code: "STARTER",
    name: "Starter",
    description: "Para administradoras iniciantes",
    price: "199,99",
    period: "/mes",
    features: [
      "Ate 3 condominios",
      "Ate 250 unidades no total",
      "Ate 500 moradores",
      "Todas as features",
      "Suporte padrao",
    ],
    cta: "Escolher plano",
    highlighted: false,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Para administradoras em crescimento",
    price: "499,99",
    period: "/mes",
    features: [
      "Ate 10 condominios",
      "Ate 1.000 unidades",
      "Ate 3.000 moradores",
      "Todas as features",
      "Suporte prioritario",
    ],
    cta: "Escolher plano",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "Para grandes operacoes",
    price: "Personalizado",
    period: "",
    features: [
      "Ate 100 condominios",
      "Volume sob consulta",
      "Ate 20.000 moradores",
      "SLA dedicado",
      "Integracoes customizadas",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="border-y border-foreground/10 bg-secondary/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Planos</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Escolha o plano ideal
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Todos os planos incluem 1 mes gratis para voce experimentar a plataforma.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "border-foreground bg-foreground text-background shadow-xl"
                  : "border-foreground/10 bg-card hover:border-foreground/20"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-accent-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${plan.highlighted ? "text-background" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-1 text-sm ${plan.highlighted ? "text-background/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-4xl font-semibold tracking-tight ${plan.highlighted ? "text-background" : "text-foreground"}`}>
                  {plan.price === "Personalizado" ? "" : "R$ "}
                  {plan.price}
                </span>
                <span className={plan.highlighted ? "text-background/70" : "text-muted-foreground"}>{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-accent" : "text-accent"}`} />
                    <span className={plan.highlighted ? "text-background/80" : "text-muted-foreground"}>{feature}</span>
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
              >
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {plan.cta}
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
