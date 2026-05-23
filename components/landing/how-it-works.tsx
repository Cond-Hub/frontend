const steps = [
  {
    step: "01",
    title: "Cadastre sua operacao",
    description: "Configure blocos, unidades, moradores e espacos comuns. A estrutura do seu condominio, organizada.",
  },
  {
    step: "02",
    title: "Gerencie o dia a dia",
    description: "Acompanhe boletos, ocorrencias, reservas e documentos em tempo real atraves do painel.",
  },
  {
    step: "03",
    title: "Conecte os moradores",
    description: "Moradores acessam o app para consultar boletos, abrir chamados e ver documentos importantes.",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="border-y border-foreground/10 bg-secondary/30 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Como funciona</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Simples de comecar, poderoso para escalar
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step number */}
              <span className="text-6xl font-semibold text-foreground/10 lg:text-7xl">{step.step}</span>
              
              {/* Content */}
              <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>

              {/* Connector line on desktop */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-8 bg-foreground/20 lg:block" style={{ transform: 'translateX(100%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
