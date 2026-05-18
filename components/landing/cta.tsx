"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap } from "lucide-react"

export function LandingCta() {
  return (
    <section className="relative py-32 lg:py-40 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        
        {/* Animated orbs */}
        <motion.div 
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Zap className="h-4 w-4" />
            Comece gratuitamente
          </span>

          {/* Headline */}
          <h2 className="mt-10 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-foreground">Como voce ainda administra</span>
            <br />
            <span className="gradient-text text-glow">condominio sem isso?</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground lg:text-xl">
            Junte-se a centenas de administradoras e sindicos que ja transformaram 
            sua gestao condominial com o CondHub.
          </p>
          
          {/* CTAs */}
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link href="/signup">
              <motion.button 
                className="btn-premium group flex items-center gap-3 rounded-full px-10 py-5 text-lg font-semibold shadow-2xl shadow-primary/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  Comecar gratuitamente
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button 
                className="btn-ghost-premium flex items-center gap-3 rounded-full px-10 py-5 text-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Ja tenho conta
              </motion.button>
            </Link>
          </div>

          {/* Trust line */}
          <motion.p 
            className="mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              1 mes gratis
            </span>
            <span className="mx-3 text-border">|</span>
            Sem cartao de credito
            <span className="mx-3 text-border">|</span>
            Cancele quando quiser
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
