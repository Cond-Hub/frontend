const stats = [
  { value: "500+", label: "Unidades gerenciadas" },
  { value: "98%", label: "Satisfacao" },
  { value: "24h", label: "Suporte" },
  { value: "100%", label: "Digital" },
]

export function LandingSocialProof() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Divider top */}
        <div className="mb-16 h-px w-full bg-foreground/10" />
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center lg:text-left">
              <p className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Divider bottom */}
        <div className="mt-16 h-px w-full bg-foreground/10" />
      </div>
    </section>
  )
}
