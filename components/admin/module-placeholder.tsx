import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ModulePlaceholder({ eyebrow, title, description }: ModulePlaceholderProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
      <Card className="border-slate-200/80">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            Esta area vai ser refeita do zero na mesma linguagem do novo dashboard.
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80">
        <CardHeader>
          <CardTitle className="text-xl">Nova direcao</CardTitle>
          <CardDescription>
            Shell novo, componentes `shadcn` e paginas separadas por rota real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>A partir daqui, cada modulo passa a ser reconstruido sem reaproveitar a composicao antiga.</p>
          <p>O objetivo e sair do monolito e ganhar layout, navegacao e pagina por contexto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
