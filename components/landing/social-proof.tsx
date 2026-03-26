export function LandingSocialProof() {
  const stats = [
    { value: "500+", label: "Condominios ativos", company: "Brasil inteiro" },
    { value: "98%", label: "Satisfacao dos usuarios", company: "NPS Score" },
    { value: "50M+", label: "Em transacoes gerenciadas", company: "Por ano" },
    { value: "24/7", label: "Suporte disponivel", company: "Sempre online" },
  ]

  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-foreground lg:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-xs text-primary">{stat.company}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-12 flex flex-col items-center text-center">
          <blockquote className="max-w-2xl text-lg italic text-muted-foreground">
            {'"'}O CondoHome transformou a forma como gerenciamos nosso condominio. A plataforma e intuitiva e nos economiza horas de trabalho toda semana.{'"'}
          </blockquote>
          <div className="mt-4">
            <p className="font-medium text-foreground">Carlos Mendes</p>
            <p className="text-sm text-muted-foreground">Sindico - Residencial Jardins</p>
          </div>
        </div>
      </div>
    </section>
  )
}
