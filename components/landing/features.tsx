import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  MessageSquare, 
  Shield, 
  BarChart3 
} from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Gestao Multi-Condominio",
    description: "Administre varios condominios em uma unica plataforma. Visao consolidada para administradoras com dashboards personalizados.",
  },
  {
    icon: CreditCard,
    title: "Cobranca Automatizada",
    description: "Gere boletos, envie lembretes e acompanhe pagamentos automaticamente. Integracao com os principais bancos do Brasil.",
  },
  {
    icon: CalendarDays,
    title: "Reservas de Areas Comuns",
    description: "Sistema completo para reservas de salao de festas, churrasqueira, academia e outras areas. Aprovacao automatica ou manual.",
  },
  {
    icon: MessageSquare,
    title: "Comunicacao Integrada",
    description: "Envie comunicados, gerencie ocorrencias e mantenha todos informados. Notificacoes por app, email e SMS.",
  },
  {
    icon: Shield,
    title: "Controle de Acesso",
    description: "Gerencie visitantes, prestadores e entregas. Integracao com portarias virtuais e sistemas de CFTV.",
  },
  {
    icon: BarChart3,
    title: "Relatorios e Analytics",
    description: "Dashboards em tempo real com metricas financeiras, operacionais e de engajamento. Tome decisoes baseadas em dados.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funcionalidades</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo que voce precisa para gerenciar seu condominio
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas poderosas e intuitivas para sindicos, administradoras e moradores.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
