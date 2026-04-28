import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingCta() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-muted/30 py-20 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Veja o que o sistema já faz hoje
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Painel administrativo, mapa de unidades, moradores, agenda, boletos, reservas e app do morador em um mesmo produto.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="group w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
              Entrar no sistema
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#pricing">
            <Button size="lg" variant="outline" className="w-full border-border text-foreground hover:bg-accent sm:w-auto">
              Ver planos
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Sem promessas extras: somente o que já está no produto.
        </p>
      </div>
    </section>
  )
}
