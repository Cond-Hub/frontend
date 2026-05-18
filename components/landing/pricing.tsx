"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles, Zap, Building2, Crown } from "lucide-react"

const whatsappNumber = "5547992611819"

const plans = [
  {
    code: "INDIVIDUAL",
    name: "Individual",
    description: "Para um unico condominio",
    price: "79,99",
    period: "/mes",
    icon: Building2,
    iconColor: "text-emerald-500",
    iconBg: "from-emerald-500/20 to-teal-500/10",
    features: [
      "1 condominio",
      "Ate 100 unidades",
      "Ate 200 moradores",
      "Todas as funcionalidades",
      "Suporte por email",
    ],
    cta: "Comecar agora",
    highlighted: false,
  },
  {
    code: "STARTER",
    name: "Starter",
    description: "Para pequenas gestoras",
    price: "199,99",
    period: "/mes",
    icon: Zap,
    iconColor: "text-primary",
    iconBg: "from-primary/20 to-cyan-500/10",
    features: [
      "Ate 3 condominios",
      "Ate 250 unidades no total",
      "Ate 500 moradores",
      "Todas as funcionalidades",
      "Suporte prioritario",
    ],
    cta: "Comecar agora",
    highlighted: false,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Para gestoras em crescimento",
    price: "499,99",
    period: "/mes",
    icon: Sparkles,
    iconColor: "text-accent",
    iconBg: "from-accent/20 to-purple-500/10",
    features: [
      "Ate 10 condominios",
      "Ate 1.000 unidades no total",
      "Ate 3.000 moradores",
      "Todas as funcionalidades",
      "Suporte prioritario",
      "Onboarding dedicado",
    ],
    cta: "Comecar agora",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "Para grandes operacoes",
    price: "Sob consulta",
    period: "",
    icon: Crown,
    iconColor: "text-yellow-500",
    iconBg: "from-yellow-500/20 to-orange-500/10",
    features: [
      "Condominios ilimitados",
      "Volume sob consulta",
      "Ate 20.000 moradores",
      "SLA garantido",
      "Suporte dedicado",
      "Integracoes customizadas",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[200px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]" />
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
            Planos
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Precos</span>{" "}
            <span className="gradient-text">transparentes</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Escolha o plano ideal para o tamanho da sua operacao. 
            Sem taxas ocultas, sem surpresas.
          </p>
          <motion.div 
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-5 py-2.5"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-foreground">1 mes gratis em todos os planos</span>
          </motion.div>
        </motion.div>

        {/* Pricing cards */}
        <div className="mx-auto mt-20 grid max-w-7xl gap-6 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`group relative flex flex-col rounded-2xl transition-all duration-500 ${
                plan.highlighted
                  ? "scale-105 lg:scale-110"
                  : ""
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Card */}
              <div className={`card-premium relative flex h-full flex-col rounded-2xl p-6 lg:p-8 ${
                plan.highlighted
                  ? "border-primary/50 glow-blue"
                  : ""
              }`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-cyan-500 px-5 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${plan.iconBg} border border-border/50`}>
                  <plan.icon className={`h-7 w-7 ${plan.iconColor}`} />
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className={`text-4xl font-bold tracking-tight ${
                    plan.highlighted ? "gradient-text" : "text-foreground"
                  }`}>
                    {plan.price === "Sob consulta" ? "" : "R$ "}
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={
                    plan.code === "ENTERPRISE"
                      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `Ola, tenho interesse no plano ${plan.name} do CondHub`,
                        )}`
                      : "/signup"
                  }
                  target={plan.code === "ENTERPRISE" ? "_blank" : undefined}
                  rel={plan.code === "ENTERPRISE" ? "noreferrer" : undefined}
                >
                  <motion.button
                    className={`group/btn w-full flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "btn-premium"
                        : "btn-ghost-premium"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2">
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>

                {/* Hover glow */}
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
