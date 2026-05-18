"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { CondoHomeBrandImage } from "@/components/brand/condohome-brand-image"

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50" 
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-x-16">
          <Link href="/" className="flex items-center">
            <CondoHomeBrandImage className="h-9 w-auto" />
          </Link>
          <div className="hidden lg:flex lg:gap-x-10">
            <Link 
              href="#features" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Funcionalidades
            </Link>
            <Link 
              href="#como-funciona" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Como funciona
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Planos
            </Link>
            <Link 
              href="#faq" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-x-5">
          <Link 
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link href="/signup">
            <button className="group flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3">
              Comece agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>
        <button
          type="button"
          className="lg:hidden p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-6">
          <div className="flex flex-col gap-4">
            <Link
              href="#features"
              className="py-2 text-lg text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              href="#como-funciona"
              className="py-2 text-lg text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Como funciona
            </Link>
            <Link
              href="#pricing"
              className="py-2 text-lg text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planos
            </Link>
            <Link
              href="#faq"
              className="py-2 text-lg text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
              <Link 
                href="/login"
                className="py-2 text-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-base font-medium text-background">
                  Comece agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
