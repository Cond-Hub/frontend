import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  ArrowUpRight
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard completo",
    description: "Visao geral do condominio em tempo real. Acompanhe metricas, alertas e o status de cada area em um unico lugar.",
    accent: true,
  },
  {
    icon: Building2,
    title: "Mapa de blocos",
    description: "Visualize a estrutura completa do condominio. Blocos, andares e unidades organizados de forma intuitiva.",
  },
  {
    icon: CreditCard,
    title: "Gestao de boletos",
    description: "Cadastre, envie e acompanhe boletos por unidade. Controle de vencimentos e status de pagamento.",
  },
  {
    icon: CalendarDays,
    title: "Agenda integrada",
    description: "Datas importantes, documentos com vencimento e reservas de espacos em uma agenda unica.",
  },
  {
    icon: MessageSquare,
    title: "Ocorrencias",
    description: "Organize chamados por etapa e prioridade. Encontre rapidamente o que precisa de atencao.",
  },
  {
    icon: Users,
    title: "Cadastro de moradores",
    description: "Gerencie moradores e associe cada cadastro as unidades correspondentes do condominio.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Funcionalidades
          </p>
          <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Tudo o que voce precisa para gerir seu condominio
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Cada ferramenta foi desenvolvida pensando na rotina real de sindicos, gestores e moradores.
          </p>
        </div>

        {/* Features grid - bento style */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-lg ${
                feature.accent ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              {/* Icon */}
              <div className={`mb-6 inline-flex rounded-xl p-3 ${
                feature.accent 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-foreground"
              }`}>
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-medium text-foreground">
                {feature.title}
              </h3>
              <p className={`mt-3 leading-relaxed text-muted-foreground ${
                feature.accent ? "text-base" : "text-sm"
              }`}>
                {feature.description}
              </p>

              {/* Hover arrow */}
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Saiba mais
                <ArrowUpRight className="h-4 w-4" />
              </div>

              {/* Decorative gradient on hover */}
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
