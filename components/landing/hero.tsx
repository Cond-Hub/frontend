"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, Home, Play, Zap, Shield, Users } from "lucide-react"
import { motion } from "framer-motion"

const residentAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.CondHub"
const adminAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.Admin"

export function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-24">
      {/* Premium background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Main gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[600px] bg-radial-glow" />
        
        {/* Animated orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Noise texture */}
        <div className="absolute inset-0 noise" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="max-w-2xl">
            {/* Eyebrow badge */}
            <motion.div 
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-medium text-primary">
                A nova era da gestao condominial
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="text-foreground">Menos caos.</span>
              <br />
              <span className="gradient-text text-glow">Mais controle.</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="mt-8 text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              A plataforma que conecta administradora, sindico e morador. 
              Tudo que sua gestao precisa em um unico sistema inteligente e automatizado.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="mt-10 flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link href="/signup">
                <motion.button 
                  className="btn-premium group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    Comecar gratuitamente
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </Link>
              <Link href="#showcase">
                <motion.button 
                  className="btn-ghost-premium group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="h-5 w-5" />
                  Ver demonstracao
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="mt-12 grid grid-cols-3 gap-6 border-t border-border/50 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div>
                <p className="text-3xl font-bold gradient-text-cyan">500+</p>
                <p className="mt-1 text-sm text-muted-foreground">Condominios</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text-cyan">15k+</p>
                <p className="mt-1 text-sm text-muted-foreground">Moradores</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text-cyan">R$2M+</p>
                <p className="mt-1 text-sm text-muted-foreground">Processados</p>
              </div>
            </motion.div>

            {/* App Store buttons */}
            <motion.div 
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link 
                href={residentAppUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-5 py-3 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <Home className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Baixe o</p>
                  <p className="text-sm font-semibold text-foreground">App Morador</p>
                </div>
              </Link>
              <Link 
                href={adminAppUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-5 py-3 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <Building2 className="h-5 w-5 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Baixe o</p>
                  <p className="text-sm font-semibold text-foreground">App Gestao</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Right content - Dashboard mockup */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Glow effects behind mockup */}
              <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
              
              {/* Main dashboard mockup */}
              <motion.div 
                className="relative z-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative rounded-2xl border border-border/50 bg-card/80 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="overflow-hidden rounded-xl bg-background">
                    <Image
                      src="/phones.webp"
                      alt="Dashboard CondHub mostrando gestao completa de condominios"
                      width={1400}
                      height={1400}
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Floating feature cards */}
              <motion.div 
                className="absolute -left-8 top-1/4 z-20 hidden lg:block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="card-premium rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">100% Seguro</p>
                      <p className="text-xs text-muted-foreground">Criptografia avancada</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -right-8 bottom-1/3 z-20 hidden lg:block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="card-premium rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Multi-condominio</p>
                      <p className="text-xs text-muted-foreground">Gestao centralizada</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50">Scroll</span>
        <motion.div 
          className="h-12 w-px bg-gradient-to-b from-primary/50 to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  )
}
