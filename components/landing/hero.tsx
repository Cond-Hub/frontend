import Link from "next/link"
import Image from "next/image"
import { Building2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

const residentAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.CondHub"
const adminAppUrl = "https://play.google.com/store/apps/details?id=com.condhub.Admin"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Baixe os apps CondHub
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              CondHub na mao de quem{" "}
              <span className="text-primary">administra e de quem mora</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground lg:text-xl">
              Acesse o app do morador para acompanhar a rotina do condomínio ou o app de gestão para operar condomínios, moradores, ocorrências, agenda, boletos e reservas.
            </p>

            {/* CTAs */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
              <Link href={residentAppUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Home className="mr-2 h-4 w-4" />
                  App Morador
                </Button>
              </Link>
              <Link href={adminAppUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full border-border text-foreground hover:bg-accent">
                  <Building2 className="mr-2 h-4 w-4" />
                  App Gestão
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute inset-x-8 bottom-0 h-24 rounded-full bg-primary/20 blur-3xl" />
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
    </section>
  )
}
