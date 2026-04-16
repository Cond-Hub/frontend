export function LandingSocialProof() {
  const stats = [
    { value: "Painel", label: "Administracao", company: "Dashboard, moradores e chamados" },
    { value: "Mapa", label: "Blocos e unidades", company: "Estrutura do condominio" },
    { value: "Agenda", label: "Datas e reservas", company: "Compromissos do dia a dia" },
    { value: "App", label: "Morador", company: "Boletos, documentos e ocorrencias" },
  ]

  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-foreground lg:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-xs text-primary">{stat.company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
