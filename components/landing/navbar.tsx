"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { CondoHomeBrandImage } from "@/components/brand/condohome-brand-image"
import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-x-16">
          <Link href="/" className="flex items-center">
            <CondoHomeBrandImage className="h-8 w-auto text-foreground" />
          </Link>
          <div className="hidden lg:flex lg:gap-x-10">
            <Link href="#features" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Planos
            </Link>
            <Link href="#faq" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              FAQ
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-x-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-transparent">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90">
              Comece Gratis
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 bg-background px-6 py-6">
            <Link
              href="#features"
              className="block py-3 text-base font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              href="#pricing"
              className="block py-3 text-base font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planos
            </Link>
            <Link
              href="#faq"
              className="block py-3 text-base font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col gap-3 pt-6">
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-center">
                  Entrar
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90">
                  Comece Gratis
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
