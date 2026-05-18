"use client"

import { motion } from "framer-motion"
import { Building2, Users, CreditCard, Star, TrendingUp, Shield } from "lucide-react"

const stats = [
  { value: "500+", label: "Condominios gerenciados", icon: Building2 },
  { value: "15k+", label: "Moradores conectados", icon: Users },
  { value: "R$2M+", label: "Boletos processados", icon: CreditCard },
  { value: "4.8", label: "Avaliacao Play Store", icon: Star },
]

const logos = [
  "Residencial Aurora", "Cond. Vista Verde", "Ed. Horizonte", 
  "Villa Floresta", "Torres Premium", "Parque das Aguas"
]

export function LandingSocialProof() {
  return (
    <section className="relative overflow-hidden border-y border-border/30 py-20 lg:py-28">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="group relative text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="card-premium relative rounded-2xl p-8 transition-all">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 transition-all group-hover:scale-110">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                
                {/* Value */}
                <div className="text-4xl font-bold gradient-text lg:text-5xl">
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="mt-2 text-sm text-muted-foreground lg:text-base">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trusted by section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Confiado por administradoras em todo Brasil
          </p>
          
          {/* Logos marquee */}
          <div className="relative mt-10 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            
            <div className="flex animate-marquee gap-12">
              {[...logos, ...logos].map((logo, index) => (
                <div 
                  key={index}
                  className="flex shrink-0 items-center gap-3 rounded-xl border border-border/30 bg-card/30 px-6 py-4 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary/70" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div 
          className="mt-16 flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 rounded-full border border-border/30 bg-card/30 px-4 py-2 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Dados criptografados</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/30 bg-card/30 px-4 py-2 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">99.9% uptime</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/30 bg-card/30 px-4 py-2 backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Suporte 24/7</span>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
