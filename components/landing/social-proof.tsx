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

        {/* Scope statement */}
        <div className="mt-12 flex flex-col items-center text-center">
          <blockquote className="max-w-2xl text-lg italic text-muted-foreground">
            {'"'}A proposta desta pagina e mostrar somente o que o sistema ja tem hoje para uso no dia a dia do condominio.{'"'}
          </blockquote>
          <div className="mt-4">
            <p className="font-medium text-foreground">Conteudo atual do sistema</p>
            <p className="text-sm text-muted-foreground">Sem promessas fora do que ja esta implementado</p>
          </div>
        </div>
      </div>
    </section>
  )
}
