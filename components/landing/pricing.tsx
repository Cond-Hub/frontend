import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const whatsappNumber = "5547992611819"

const plans = [
  {
    code: "STARTER",
    name: "Starter",
    description: "Para empresas gestoras pequenas que querem centralizar os primeiros condominios.",
    price: "199",
    period: "/mes",
    features: [
      "Ate 3 condominios",
      "Ate 250 unidades no total",
      "Ate 500 moradores",
      "Todas as features principais inclusas",
      "Suporte padrao",
      "Condominio extra: R$ 49/mes",
    ],
    cta: "Escolher plano",
    highlighted: false,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Para empresas gestoras que ja operam multiplos condominios e precisam de escala.",
    price: "499",
    period: "/mes",
    features: [
      "Ate 10 condominios",
      "Ate 1.000 unidades no total",
      "Ate 3.000 moradores",
      "Todas as features principais inclusas",
      "Suporte prioritario",
      "Condominio extra: R$ 39/mes",
    ],
    cta: "Escolher plano",
    highlighted: true,
    badge: "Mais escolhido",
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "Para empresas gestoras com alto volume e necessidades avancadas.",
    price: "Sob consulta",
    period: "",
    features: [
      "Ate 100 condominios ou volume negociado",
      "Volume de unidades sob consulta",
      "Ate 20.000 moradores",
      "Todas as features principais inclusas",
      "SLA e suporte prioritario",
      "Integracoes e condicoes comerciais sob demanda",
      "Condominio extra: sob consulta",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

const includedFeatures = [
  "Multi-condominio",
  "Workspace da empresa",
  "Moradores e unidades",
  "Ocorrencias e documentos",
  "Agenda, espacos e reservas",
  "Boletos, Carteira e PIX",
  "Branding por condominio",
]

export function LandingPricing() {
  return (
    <section id="pricing" className="border-y border-border bg-muted/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Planos</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Escolha o plano ideal para sua empresa
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todos os planos incluem as features principais. A diferenca esta no volume, suporte e condicoes comerciais.
          </p>
          <p className="mt-3 text-sm font-semibold text-primary">Todos os planos com 1 mes gratis para comecar.</p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-foreground">Incluso em todos os planos</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
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
                <div className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  1 mes gratis
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price === "Sob consulta" ? "" : "R$ "}
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
                href={
                  plan.code === "ENTERPRISE"
                    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Olá, tenho interesse no plano ${plan.name} da ContHub`,
                      )}`
                    : `/signup?plan=${plan.code}`
                }
                target={plan.code === "ENTERPRISE" ? "_blank" : undefined}
                rel={plan.code === "ENTERPRISE" ? "noreferrer" : undefined}
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
