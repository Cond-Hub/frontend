import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, Home } from "lucide-react"

const residentAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.CondHub"
const adminAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.Admin"

export function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.03),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="landing-fade-up mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-sm text-muted-foreground">
                Disponivel na Play Store
              </span>
            </div>

            {/* Headline */}
            <h1 className="landing-fade-up delay-100 text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              Gestao de{" "}
              <span className="relative inline-block">
                <span className="relative z-10">condominios</span>
                <span className="absolute bottom-2 left-0 -z-0 h-3 w-full bg-primary/20 lg:bottom-3 lg:h-4" />
              </span>{" "}
              simplificada
            </h1>

            {/* Description */}
            <p className="landing-fade-up delay-200 mt-8 text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              A plataforma completa para sindicos, gestores e moradores organizarem a rotina do condominio com eficiencia e transparencia.
            </p>

            {/* App download buttons */}
            <div className="landing-fade-up delay-300 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link 
                href={residentAppUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-base font-medium text-background transition-all hover:shadow-lg hover:shadow-foreground/10"
              >
                <Home className="h-5 w-5" />
                App Morador
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href={adminAppUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-4 text-base font-medium text-foreground transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <Building2 className="h-5 w-5" />
                App Gestao
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="landing-fade-up delay-400 mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>1 mes gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Sem cartao</span>
              </div>
            </div>
          </div>

          {/* Right content - App showcase */}
          <div className="landing-slide-left delay-300 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Decorative elements */}
              <div className="absolute -bottom-8 -left-8 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
              
              {/* Phone mockup */}
              <div className="relative aspect-square">
                <Image
                  src="/phones.webp"
                  alt="Telas dos aplicativos CondHub para moradores e administradores"
                  width={1400}
                  height={1400}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </div>
    </section>
  )
}
