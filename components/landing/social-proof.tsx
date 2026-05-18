const stats = [
  { value: "500+", label: "Condominios ativos" },
  { value: "15k+", label: "Moradores" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.8", label: "Avaliacao na Play Store" },
]

export function LandingSocialProof() {
  return (
    <section className="border-y border-border/50 bg-card/30 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
            >
              <div className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
