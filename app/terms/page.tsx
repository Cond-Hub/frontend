import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: '1. Teste gratuito de 1 mês',
    body:
      'A conta da administradora inicia com 1 mês de teste gratuito, sem cobrança imediata, com os mesmos limites operacionais do plano Pro: até 10 condomínios ativos, até 1.000 unidades por condomínio e até 3.000 moradores.',
  },
  {
    title: '2. Quando os planos pagos aparecem',
    body:
      'Durante o período grátis, a operação segue ativa com os limites do Pro. Os planos pagos passam a ser exigidos apenas depois do encerramento desse período gratuito.',
  },
  {
    title: '3. Enquadramento da carteira após o trial',
    body:
      'Ao final do teste gratuito, a administradora deve contratar um plano compatível com a carteira ativa. Se a operação estiver com 10 condomínios, por exemplo, o enquadramento esperado é o plano Pro. Para contratar um plano menor, a carteira precisa ser reduzida antes da contratação ou ajustada com nosso time comercial.',
  },
  {
    title: '4. Taxa operacional',
    body:
      'A plataforma possui taxa operacional de R$ 1,99 por transação recebida nas rotinas financeiras aplicáveis. Essa taxa não substitui tarifas de gateways, bancos, instituições de pagamento ou demais terceiros envolvidos na operação.',
  },
  {
    title: '5. Responsabilidade pelos dados',
    body:
      'A administradora e os usuários autorizados são responsáveis pela veracidade, atualização e legitimidade dos dados cadastrados, incluindo condomínios, unidades, moradores, documentos, cobranças, reservas, ocorrências e contatos.',
  },
  {
    title: '6. LGPD e base legal',
    body:
      'Ao utilizar a plataforma, a administradora declara possuir base legal adequada para tratar dados pessoais inseridos no sistema, observando a LGPD e demais regras aplicáveis ao tratamento de dados.',
  },
  {
    title: '7. Uso aceitável da plataforma',
    body:
      'E proibido usar a CondHub para fraude, cobrança indevida, armazenamento de conteúdo ilícito, tentativa de invasão, engenharia reversa, envio malicioso de arquivos ou qualquer uso que comprometa a segurança ou a confiabilidade da plataforma.',
  },
  {
    title: '8. Arquivos e anexos',
    body:
      'Todo arquivo enviado deve estar relacionado a operação real da carteira e livre de malware. Arquivos indevidos, fraudulentos ou potencialmente nocivos podem motivar bloqueio preventivo da conta.',
  },
  {
    title: '9. Credenciais e acessos',
    body:
      'O acesso ao painel é pessoal e intransferível. A administradora é responsável por controlar credenciais, conceder acessos, remover usuários inativos e manter a governança interna da operação.',
  },
  {
    title: '10. Manutenção e disponibilidade',
    body:
      'A CondHub pode realizar manutenções, atualizações de segurança e ajustes técnicos para manter a estabilidade da plataforma. Sempre que possível, essas intervenções serao planejadas para reduzir impacto operacional.',
  },
  {
    title: '11. Suporte e escopo comercial',
    body:
      'O suporte acontece pelos canais oficiais da CondHub. Demandas fora do escopo padrão, integrações especiais, operações enterprise ou carteiras acima das faixas públicas podem exigir contratação especifica.',
  },
  {
    title: '12. Aceite',
    body:
      'Ao marcar o aceite no cadastro, o gestor confirma que leu e compreendeu estes termos, incluindo o funcionamento do teste gratuito, das taxas operacionais e das regras de enquadramento da carteira ao final do período grátis.',
  },
];

export default function TermsPage() {
  return (
    <div className="dark">
      <main className="min-h-screen bg-background text-foreground">
        <LandingNavbar />

        <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(250,204,21,0.1),transparent_20%)]">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Termos do teste gratuito e da operação
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Regras comerciais e operacionais da jornada inicial
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Esta página consolida as condições do período grátis, o enquadramento em plano pago e as responsabilidades operacionais aceitas no cadastro da administradora.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.title} className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{section.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <LandingFooter />
      </main>
    </div>
  );
}
