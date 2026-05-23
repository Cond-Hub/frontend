import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  BarChart3,
  ArrowUpRight 
} from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Mapa de blocos e unidades",
    description: "Visualize toda a estrutura do condominio em um unico lugar. Cadastre blocos, andares e unidades com facilidade.",
  },
  {
    icon: CreditCard,
    title: "Gestao de boletos",
    description: "Cadastre boletos por unidade, anexe documentos e acompanhe status de pagamento em tempo real.",
  },
  {
    icon: CalendarDays,
    title: "Agenda integrada",
    description: "Organize assembleias, reservas de espacos comuns e documentos com vencimento em uma agenda unica.",
  },
  {
    icon: MessageSquare,
    title: "Ocorrencias e chamados",
    description: "Gerencie chamados por etapa e prioridade. Encontre rapidamente o que precisa de atencao.",
  },
  {
    icon: Users,
    title: "Cadastro de moradores",
    description: "Gerencie moradores e associe cada cadastro as suas respectivas unidades de forma organizada.",
  },
  {
    icon: BarChart3,
    title: "Dashboard completo",
    description: "Visao resumida do condominio com metricas importantes para acompanhar a operacao diaria.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Funcionalidades</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Tudo que voce precisa para gerir seu condominio
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Cada funcionalidade foi pensada para simplificar o dia a dia do sindico e da administradora.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card p-8 transition-all duration-300 hover:border-foreground/20 hover:bg-card/80"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute right-6 top-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5 text-foreground/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
