import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Gestao condominial moderna
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            A plataforma completa para{" "}
            <span className="text-primary">gestao de condominios</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground lg:text-xl">
            Simplifique a administracao do seu condominio com ferramentas inteligentes para moradores, sindicos e administradoras. Tudo em um so lugar.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="group w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
                Comece Gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full border-border text-foreground hover:bg-accent sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Ver Demonstracao
            </Button>
          </div>
        </div>

        {/* Product Mockup */}
        <div className="mt-16 lg:mt-24">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-50 blur-2xl" />
            
            {/* Dashboard mockup */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1">
                  <div className="mx-auto w-fit rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
                    app.condohome.com.br
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="grid gap-4 p-6 lg:grid-cols-3">
                {/* Stats cards */}
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Moradores Ativos</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">1,248</p>
                  <p className="mt-1 text-xs text-primary">+12% este mes</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Taxa de Adimplencia</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">97.3%</p>
                  <p className="mt-1 text-xs text-primary">+2.1% vs. media</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Ocorrencias Resolvidas</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">156</p>
                  <p className="mt-1 text-xs text-primary">98% no prazo</p>
                </div>
                
                {/* Chart placeholder */}
                <div className="col-span-full rounded-lg border border-border bg-background p-4 lg:col-span-2">
                  <p className="mb-4 text-sm font-medium text-foreground">Receitas vs Despesas</p>
                  <div className="flex h-32 items-end gap-2">
                    {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((height, i) => (
                      <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                
                {/* Activity list */}
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">Atividade Recente</p>
                  <div className="space-y-3">
                    {[
                      "Reserva confirmada",
                      "Pagamento recebido",
                      "Nova ocorrencia",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
