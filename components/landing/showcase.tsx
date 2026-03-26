import { Check, Bell, FileText, Users } from "lucide-react"

export function LandingShowcase() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Produto</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Uma interface pensada para produtividade
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Design limpo e funcional que torna o dia a dia mais simples.
          </p>
        </div>

        {/* Product showcase grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Main feature */}
          <div className="row-span-2 overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-8">
            <div className="mb-6">
              <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">Gestao Financeira Completa</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Controle total sobre receitas, despesas, inadimplencia e previsao orcamentaria.
              </p>
            </div>
            
            {/* Mock financial dashboard */}
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Fluxo de Caixa - Marco 2024</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Atualizado</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receitas</span>
                  <span className="font-medium text-foreground">R$ 125.430,00</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[85%] rounded-full bg-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Despesas</span>
                  <span className="font-medium text-foreground">R$ 98.240,00</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[65%] rounded-full bg-accent" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-medium text-foreground">Saldo</span>
                  <span className="font-bold text-primary">R$ 27.190,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary features */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Central de Notificacoes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comunicados, alertas e lembretes em tempo real.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { title: "Assembleia agendada", time: "Amanha, 19h" },
                { title: "Vencimento taxa", time: "Em 5 dias" },
                { title: "Manutencao concluida", time: "Hoje" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                  <span className="text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Portal do Morador</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Autoatendimento completo via app ou web.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                "2a via de boleto",
                "Reservar areas",
                "Abrir ocorrencia",
                "Ver comunicados",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
