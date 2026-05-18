"use client"

import { motion } from "framer-motion"
import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  ArrowUpRight,
  Smartphone,
  QrCode,
  FileText,
  Bell,
  BarChart3
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard inteligente",
    description: "Visao 360 do seu condominio. Metricas em tempo real, alertas automaticos e insights para tomada de decisao.",
    gradient: "from-primary/20 to-cyan-500/20",
    iconColor: "text-primary",
    size: "large",
  },
  {
    icon: Building2,
    title: "Mapa de blocos",
    description: "Visualize blocos, andares e unidades em uma interface interativa e moderna.",
    gradient: "from-accent/20 to-purple-500/20",
    iconColor: "text-accent",
  },
  {
    icon: CreditCard,
    title: "Boletos & PIX",
    description: "Gere e envie boletos automaticamente. Receba via PIX com confirmacao instantanea.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: Smartphone,
    title: "App do morador",
    description: "Aplicativo completo para moradores acessarem boletos, reservas, ocorrencias e documentos.",
    gradient: "from-primary/20 to-blue-500/20",
    iconColor: "text-primary",
    size: "large",
  },
  {
    icon: CalendarDays,
    title: "Reservas online",
    description: "Sistema de reservas de espacos com calendario visual e aprovacao automatica.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Ocorrencias",
    description: "Kanban visual para gerenciar chamados por status e prioridade.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
  {
    icon: Users,
    title: "Multi-condominio",
    description: "Gerencie multiplos condominios em uma unica plataforma centralizada.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-500",
  },
  {
    icon: BarChart3,
    title: "Relatorios",
    description: "Analytics avancado com graficos e exportacao de dados financeiros.",
    gradient: "from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-500",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-28 lg:py-36">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Funcionalidades
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Tudo que sua</span>
            <br />
            <span className="gradient-text">administradora precisa</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Cada ferramenta foi desenvolvida para eliminar o caos operacional 
            e trazer eficiencia para sua gestao condominial.
          </p>
        </motion.div>

        {/* Features bento grid */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`group relative overflow-hidden rounded-2xl ${
                feature.size === "large" ? "lg:col-span-2" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <div className="card-premium relative h-full rounded-2xl p-8 transition-all duration-500">
                {/* Gradient background on hover */}
                <div className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                {/* Icon */}
                <div className="mb-6 inline-flex rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 group-hover:border-transparent group-hover:bg-white/10">
                  <feature.icon className={`h-7 w-7 ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground lg:text-2xl">
                  {feature.title}
                </h3>
                <p className={`mt-3 leading-relaxed text-muted-foreground ${
                  feature.size === "large" ? "text-base lg:text-lg" : "text-sm lg:text-base"
                }`}>
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                  Saiba mais
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                {/* Corner glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
