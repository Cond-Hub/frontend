import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LandingCta() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-balance text-3xl font-medium tracking-tight text-background sm:text-4xl lg:text-5xl">
          Pronto para simplificar a gestao do seu condominio?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-background/70">
          Comece seu periodo gratuito hoje. Sem cartao de credito, sem compromisso.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-medium text-foreground transition-all hover:shadow-xl"
          >
            Comecar gratuitamente
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/login"
            className="flex items-center gap-2 rounded-full border border-background/20 px-8 py-4 text-base font-medium text-background transition-all hover:bg-background/10"
          >
            Ja tenho conta
          </Link>
        </div>

        <p className="mt-8 text-sm text-background/50">
          Mais de 500 condominios ja confiam no CondHub
        </p>
      </div>
    </section>
  )
}
