import { Check, ArrowUpRight } from "lucide-react"

const capabilities = [
  {
    title: "Gestao financeira completa",
    description: "Boletos por unidade com status, anexos e acompanhamento de vencimento. Tudo integrado.",
    features: ["Cadastro de boletos", "Status em tempo real", "Anexos e documentos", "Filtros avancados"],
    highlight: true,
  },
  {
    title: "Agenda e reservas",
    description: "Organize assembleias, reservas de espacos comuns e documentos com vencimento em uma visao unificada.",
    features: ["Agenda semanal", "Reservas de espacos", "Documentos com vencimento", "Notificacoes"],
    highlight: false,
  },
  {
    title: "App do morador",
    description: "Moradores consultam boletos, documentos, abrem chamados e acompanham datas importantes pelo celular.",
    features: ["Login seguro", "Boletos e documentos", "Abertura de chamados", "Notificacoes push"],
    highlight: false,
  },
]

export function LandingShowcase() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Plataforma</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Modulos prontos para uso
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tudo o que voce ve aqui ja esta funcionando e pronto para transformar a gestao do seu condominio.
          </p>
        </div>

        {/* Product showcase grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
                capability.highlight 
                  ? "border-foreground/20 bg-foreground text-background" 
                  : "border-foreground/10 bg-card hover:border-foreground/20"
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                <h3 className={`text-xl font-semibold ${capability.highlight ? "text-background" : "text-foreground"}`}>
                  {capability.title}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${capability.highlight ? "text-background/70" : "text-muted-foreground"}`}>
                  {capability.description}
                </p>
              </div>

              {/* Features */}
              <ul className="mt-auto space-y-3">
                {capability.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${capability.highlight ? "text-accent" : "text-accent"}`} />
                    <span className={capability.highlight ? "text-background/80" : "text-muted-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover arrow */}
              <div className={`absolute right-6 top-6 transition-opacity duration-300 ${capability.highlight ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <ArrowUpRight className={`h-5 w-5 ${capability.highlight ? "text-background/40" : "text-foreground/40"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
