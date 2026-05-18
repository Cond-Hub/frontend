import { Check, Smartphone, Monitor, Bell } from "lucide-react"

const capabilities = [
  "Gestao de boletos por unidade",
  "Agenda com reservas de espacos",
  "Mapa de blocos e andares",
  "Ocorrencias e chamados",
  "Documentos e comunicados",
  "Notificacoes em tempo real",
]

export function LandingShowcase() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left - Content */}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Plataforma completa
            </p>
            <h2 className="mt-4 text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              App para moradores, painel para gestores
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              O morador acessa boletos, documentos e abre ocorrencias pelo celular. O gestor opera tudo pelo painel administrativo.
            </p>

            {/* Capability list */}
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {capabilities.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Visual cards */}
          <div className="relative">
            {/* Decorative blur */}
            <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            
            <div className="relative grid gap-4">
              {/* App card */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">App do Morador</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Disponivel na Play Store. Acesse boletos, documentos e abra ocorrencias.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Boletos", "Documentos", "Ocorrencias", "Reservas"].map((tag) => (
                    <span 
                      key={tag}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Admin card */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
                    <Monitor className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Painel Administrativo</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dashboard completo para sindicos e gestores gerenciarem tudo.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Dashboard", "Moradores", "Financeiro", "Relatorios"].map((tag) => (
                    <span 
                      key={tag}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notification card */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificacoes em tempo real</p>
                    <p className="text-xs text-muted-foreground">Moradores e gestores sempre atualizados</p>
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
