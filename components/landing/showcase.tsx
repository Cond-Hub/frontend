"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { 
  Check, 
  Smartphone, 
  Monitor, 
  Bell, 
  CreditCard, 
  FileText, 
  Calendar,
  MessageSquare,
  BarChart3,
  Users,
  Building2,
  Shield
} from "lucide-react"

const appFeatures = [
  { icon: CreditCard, text: "Boletos e PIX" },
  { icon: FileText, text: "Documentos" },
  { icon: Calendar, text: "Reservas" },
  { icon: MessageSquare, text: "Ocorrencias" },
  { icon: Bell, text: "Notificacoes push" },
]

const adminFeatures = [
  { icon: BarChart3, text: "Dashboard analytics" },
  { icon: Users, text: "Gestao de moradores" },
  { icon: Building2, text: "Mapa de unidades" },
  { icon: CreditCard, text: "Financeiro completo" },
  { icon: Shield, text: "Multi-condominio" },
]

export function LandingShowcase() {
  return (
    <section id="showcase" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[200px]" />
        <div className="absolute left-0 bottom-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[150px]" />
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
            <Monitor className="h-4 w-4" />
            Plataforma completa
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Dashboard que parece</span>
            <br />
            <span className="gradient-text">software de bilhao</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Interface moderna e intuitiva que transforma a gestao condominial
            em uma experiencia premium.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div 
          className="mt-20 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Glow behind dashboard */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent rounded-3xl blur-3xl" />
          
          <div className="relative rounded-2xl border border-border/50 bg-card/80 p-2 lg:p-3 shadow-2xl shadow-black/50 backdrop-blur-xl glow-subtle">
            <div className="overflow-hidden rounded-xl bg-background aspect-video relative">
              {/* Placeholder dashboard - ideally replace with actual screenshot */}
              <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card">
                <div className="h-full w-full p-6 lg:p-10">
                  {/* Mock dashboard header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                      <div className="h-8 w-48 rounded-lg bg-border/50" />
                      <div className="h-4 w-32 rounded bg-border/30" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/20" />
                      <div className="h-10 w-10 rounded-xl bg-border/50" />
                    </div>
                  </div>
                  
                  {/* Mock stats row */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-xl border border-border/30 bg-card/50 p-4">
                        <div className="h-3 w-16 rounded bg-border/40 mb-3" />
                        <div className="h-8 w-24 rounded bg-gradient-to-r from-primary/30 to-cyan-500/30" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Mock content grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 rounded-xl border border-border/30 bg-card/50 p-4 h-48">
                      <div className="h-3 w-24 rounded bg-border/40 mb-4" />
                      <div className="flex gap-2 h-32">
                        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-cyan-500/20" 
                            style={{ height: `${h}%`, marginTop: 'auto' }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/30 bg-card/50 p-4">
                      <div className="h-3 w-20 rounded bg-border/40 mb-4" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-accent/20" />
                            <div className="flex-1">
                              <div className="h-2 w-full rounded bg-border/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* App & Admin features */}
        <div className="mt-24 grid gap-8 lg:grid-cols-2">
          {/* Mobile App */}
          <motion.div
            className="card-premium rounded-2xl p-8 lg:p-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">App do Morador</h3>
                <p className="text-sm text-muted-foreground">Disponivel na Play Store</p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Interface moderna e intuitiva para moradores acessarem boletos, 
              abrirem ocorrencias, fazerem reservas e receberem comunicados.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {appFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-4"
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Admin Panel */}
          <motion.div
            className="card-premium rounded-2xl p-8 lg:p-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/10 border border-accent/20">
                <Monitor className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Painel Administrativo</h3>
                <p className="text-sm text-muted-foreground">Web + App de Gestao</p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Dashboard completo para sindicos e administradoras gerenciarem 
              todos os aspectos do condominio em uma unica plataforma.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {adminFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-4"
                >
                  <feature.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
