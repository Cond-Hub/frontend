import { LandingHero } from "@/components/landing/hero"
import { LandingSocialProof } from "@/components/landing/social-proof"
import { LandingFeatures } from "@/components/landing/features"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingShowcase } from "@/components/landing/showcase"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingFaq } from "@/components/landing/faq"
import { LandingCta } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"
import { LandingNavbar } from "@/components/landing/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <LandingHero />
      <LandingSocialProof />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingShowcase />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  )
}
