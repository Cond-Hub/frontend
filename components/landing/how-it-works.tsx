import { UserPlus, Settings, Rocket } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crie sua conta",
    description: "Cadastre seu condominio em menos de 2 minutos. Sem burocracia, sem contratos longos. Comece com nosso plano gratuito.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Configure seu condominio",
    description: "Importe seus dados ou comece do zero. Nossa equipe de sucesso do cliente ajuda na migracao completa dos seus dados.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Comece a usar",
    description: "Convide moradores, ative recursos e transforme a gestao do seu condominio. Suporte 24/7 sempre disponivel.",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="border-y border-border bg-muted/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como Funciona</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comece em 3 passos simples
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Do cadastro ate a gestao completa em minutos, nao em semanas.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                {/* Step number & icon */}
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
