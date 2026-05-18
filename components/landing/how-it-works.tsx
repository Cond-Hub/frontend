"use client"

import { motion } from "framer-motion"
import { ArrowRight, UserPlus, Building, Rocket, Sparkles } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre sua administradora ou condominio em menos de 2 minutos. Sem burocracia, sem cartao de credito.",
    color: "primary",
  },
  {
    number: "02",
    icon: Building,
    title: "Configure a estrutura",
    description: "Monte blocos, andares e unidades. Importe moradores via planilha ou cadastre manualmente.",
    color: "accent",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Comece a operar",
    description: "Gerencie boletos, ocorrencias, reservas e comunicados. Tudo centralizado e automatizado.",
    color: "emerald",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[200px]" />
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
            <Sparkles className="h-4 w-4" />
            Como funciona
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Comece em</span>{" "}
            <span className="gradient-text">minutos</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Processo simples e intuitivo. Seu condominio organizado em 3 passos.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-20 relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />
          
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Connector arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
                    >
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </motion.div>
                  </div>
                )}

                <div className="card-premium group relative h-full rounded-2xl p-8 lg:p-10 transition-all duration-500 hover:border-primary/30">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border/50">
                    <span className="text-2xl font-bold gradient-text">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`mb-6 inline-flex rounded-xl p-4 ${
                    step.color === "primary" 
                      ? "bg-primary/10 text-primary" 
                      : step.color === "accent" 
                        ? "bg-accent/10 text-accent"
                        : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    <step.icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Glow effect */}
                  <div className={`pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                    step.color === "primary" 
                      ? "bg-primary/20" 
                      : step.color === "accent" 
                        ? "bg-accent/20"
                        : "bg-emerald-500/20"
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
