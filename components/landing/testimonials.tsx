"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Ricardo Mendes",
    role: "Sindico Profissional",
    company: "Residencial Aurora",
    content: "Antes do CondHub, eu perdia horas com planilhas e WhatsApp. Agora tenho tudo centralizado e os moradores adoram o app. A gestao ficou muito mais profissional.",
    rating: 5,
  },
  {
    name: "Fernanda Costa",
    role: "Diretora de Operacoes",
    company: "Gestao Total Adm.",
    content: "Gerenciamos 12 condominios com a mesma equipe que antes cuidava de 5. A automacao de boletos e a comunicacao com moradores mudou completamente nossa produtividade.",
    rating: 5,
  },
  {
    name: "Carlos Eduardo",
    role: "Administrador",
    company: "Premium Condominios",
    content: "O dashboard financeiro e os relatorios automaticos impressionam nossos clientes. O suporte e excepcional - respondem em minutos. Recomendo fortemente.",
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/3 blur-[200px]" />
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
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent">
            <Star className="h-4 w-4 fill-accent" />
            Depoimentos
          </span>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Quem usa,</span>{" "}
            <span className="gradient-text-purple">recomenda</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Veja o que sindicos e administradoras falam sobre o CondHub.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="card-premium group relative rounded-2xl p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-2 opacity-10">
                <Quote className="h-16 w-16 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-8 relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold text-foreground">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary">{testimonial.company}</p>
                </div>
              </div>

              {/* Hover glow */}
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div 
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div>
            <p className="text-4xl font-bold gradient-text">4.8</p>
            <p className="text-sm text-muted-foreground">Avaliacao Play Store</p>
          </div>
          <div className="h-12 w-px bg-border/50 hidden sm:block" />
          <div>
            <p className="text-4xl font-bold gradient-text">500+</p>
            <p className="text-sm text-muted-foreground">Condominios ativos</p>
          </div>
          <div className="h-12 w-px bg-border/50 hidden sm:block" />
          <div>
            <p className="text-4xl font-bold gradient-text">98%</p>
            <p className="text-sm text-muted-foreground">Satisfacao dos clientes</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
