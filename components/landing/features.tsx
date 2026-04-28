import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  BarChart3 
} from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Mapa de blocos e unidades",
    description: "Cadastre blocos, andares e unidades e acompanhe a situação de cada unidade em um único lugar.",
  },
  {
    icon: CreditCard,
    title: "Boletos por unidade",
    description: "Cadastre boletos, envie anexos, acompanhe vencimento e filtre por status e unidade.",
  },
  {
    icon: CalendarDays,
    title: "Agenda do condomínio",
    description: "Organize datas importantes, documentos com vencimento e reservas em uma agenda única por semana.",
  },
  {
    icon: MessageSquare,
    title: "Ocorrências e chamados",
    description: "Organize os chamados por etapa, veja prioridades e encontre rapidamente o que precisa de atenção.",
  },
  {
    icon: Users,
    title: "Moradores e unidades",
    description: "Gerencie moradores e associe cada cadastro as unidades correspondentes dentro do condomínio.",
  },
  {
    icon: BarChart3,
    title: "Dashboard geral",
    description: "Tenha uma visão resumida do condomínio para acompanhar o que está acontecendo no painel.",
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
            O que o produto entrega hoje
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada bloco abaixo corresponde a telas e funções que já existem hoje no sistema.
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
