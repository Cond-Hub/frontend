import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre sua empresa gestora ou condominio em poucos minutos. Sem burocracia.",
  },
  {
    number: "02",
    title: "Configure a estrutura",
    description: "Monte blocos, andares, unidades e cadastre moradores no sistema de forma intuitiva.",
  },
  {
    number: "03",
    title: "Opere no dia a dia",
    description: "Gerencie ocorrencias, boletos, reservas e mantenha tudo organizado em um so lugar.",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 lg:py-32 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Como funciona
          </p>
          <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Comece a usar em minutos
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Processo simples e direto para voce comecar a organizar seu condominio.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-12 hidden w-full items-center lg:flex">
                  <div className="h-px flex-1 bg-border" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}

              <div className="relative rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-lg">
                {/* Step number */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-5xl font-light tracking-tighter text-primary/20">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
