"use client"

import { motion } from "framer-motion"
import { 
  XCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  MessageSquareWarning, 
  AlertTriangle,
  Clock,
  Shuffle,
  Ban
} from "lucide-react"

const problems = [
  { icon: FileSpreadsheet, text: "Planilhas desorganizadas e perdidas" },
  { icon: MessageSquareWarning, text: "Mensagens perdidas em grupos de WhatsApp" },
  { icon: AlertTriangle, text: "Inadimplencia fora de controle" },
  { icon: Shuffle, text: "Processos manuais e repetitivos" },
  { icon: Clock, text: "Horas perdidas em tarefas administrativas" },
  { icon: Ban, text: "Dificuldade na comunicacao com moradores" },
]

const solutions = [
  { text: "Gestao centralizada em um unico lugar" },
  { text: "Comunicacao unificada e organizada" },
  { text: "Cobranca automatizada com PIX integrado" },
  { text: "Automacao de processos repetitivos" },
  { text: "Relatorios instantaneos e precisos" },
  { text: "App dedicado para moradores" },
]

export function LandingProblems() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-destructive/5 blur-[150px]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive">
              <XCircle className="h-4 w-4" />
              O problema
            </div>
            <h3 className="mt-6 text-3xl font-bold text-foreground lg:text-4xl">
              Voce ainda gerencia condominios assim?
            </h3>
            <div className="mt-10 space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 rounded-xl border border-destructive/10 bg-destructive/5 p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <problem.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">{problem.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              A solucao
            </div>
            <h3 className="mt-6 text-3xl font-bold text-foreground lg:text-4xl">
              Com o CondHub, tudo muda
            </h3>
            <div className="mt-10 space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{solution.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
