import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const residentAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.CondHub"
const adminAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.Admin"

export function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="landing-fade mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Nova plataforma para gestao condominial
          </div>

          {/* Headline */}
          <h1 className="landing-fade-delay-1 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Gestao condominial{" "}
            <span className="italic">simplificada</span>
          </h1>

          {/* Subheadline */}
          <p className="landing-fade-delay-2 mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Plataforma completa para sindicos e administradoras. Controle moradores, financeiro, ocorrencias e reservas em um unico lugar.
          </p>

          {/* CTAs */}
          <div className="landing-fade-delay-3 mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="group h-12 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90">
                Comece agora
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 rounded-full border-foreground/20 px-8 text-base text-foreground hover:bg-foreground/5">
                Conheca a plataforma
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* App links */}
          <div className="landing-fade-delay-3 mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <Link href={residentAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              App Morador
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="h-4 w-px bg-foreground/20" />
            <Link href={adminAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              App Gestao
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Product showcase */}
        <div className="landing-scale relative mx-auto mt-16 max-w-5xl lg:mt-20">
          <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-foreground/5">
            <Image
              src="/phones.webp"
              alt="Telas dos aplicativos CondHub para moradores e administradores"
              width={1400}
              height={900}
              priority
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
