import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: '1. Teste gratuito de 1 mes',
    body:
      'A conta da administradora inicia com 1 mes de teste gratuito, sem cobranca imediata, com os mesmos limites operacionais do plano Pro: ate 10 condominios ativos, ate 1.000 unidades por condominio e ate 3.000 moradores.',
  },
  {
    title: '2. Quando os planos pagos aparecem',
    body:
      'Durante o periodo gratis, a operacao segue ativa com os limites do Pro. Os planos pagos passam a ser exigidos apenas depois do encerramento desse periodo gratuito.',
  },
  {
    title: '3. Enquadramento da carteira apos o trial',
    body:
      'Ao final do teste gratuito, a administradora deve contratar um plano compativel com a carteira ativa. Se a operacao estiver com 10 condominios, por exemplo, o enquadramento esperado e o plano Pro. Para contratar um plano menor, a carteira precisa ser reduzida antes da contratacao ou ajustada com nosso time comercial.',
  },
  {
    title: '4. Taxa operacional',
    body:
      'A plataforma possui taxa operacional de R$ 1,99 por transacao recebida nas rotinas financeiras aplicaveis. Essa taxa nao substitui tarifas de gateways, bancos, instituicoes de pagamento ou demais terceiros envolvidos na operacao.',
  },
  {
    title: '5. Responsabilidade pelos dados',
    body:
      'A administradora e os usuarios autorizados sao responsaveis pela veracidade, atualizacao e legitimidade dos dados cadastrados, incluindo condominios, unidades, moradores, documentos, cobrancas, reservas, ocorrencias e contatos.',
  },
  {
    title: '6. LGPD e base legal',
    body:
      'Ao utilizar a plataforma, a administradora declara possuir base legal adequada para tratar dados pessoais inseridos no sistema, observando a LGPD e demais regras aplicaveis ao tratamento de dados.',
  },
  {
    title: '7. Uso aceitavel da plataforma',
    body:
      'E proibido usar a CondHub para fraude, cobranca indevida, armazenamento de conteudo ilicito, tentativa de invasao, engenharia reversa, envio malicioso de arquivos ou qualquer uso que comprometa a seguranca ou a confiabilidade da plataforma.',
  },
  {
    title: '8. Arquivos e anexos',
    body:
      'Todo arquivo enviado deve estar relacionado a operacao real da carteira e livre de malware. Arquivos indevidos, fraudulentos ou potencialmente nocivos podem motivar bloqueio preventivo da conta.',
  },
  {
    title: '9. Credenciais e acessos',
    body:
      'O acesso ao painel e pessoal e intransferivel. A administradora e responsavel por controlar credenciais, conceder acessos, remover usuarios inativos e manter a governanca interna da operacao.',
  },
  {
    title: '10. Manutencao e disponibilidade',
    body:
      'A CondHub pode realizar manutencoes, atualizacoes de seguranca e ajustes tecnicos para manter a estabilidade da plataforma. Sempre que possivel, essas intervencoes serao planejadas para reduzir impacto operacional.',
  },
  {
    title: '11. Suporte e escopo comercial',
    body:
      'O suporte acontece pelos canais oficiais da CondHub. Demandas fora do escopo padrao, integracoes especiais, operacoes enterprise ou carteiras acima das faixas publicas podem exigir contratacao especifica.',
  },
  {
    title: '12. Aceite',
    body:
      'Ao marcar o aceite no cadastro, o gestor confirma que leu e compreendeu estes termos, incluindo o funcionamento do teste gratuito, das taxas operacionais e das regras de enquadramento da carteira ao final do periodo gratis.',
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
              Termos do teste gratuito e da operacao
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Regras comerciais e operacionais da jornada inicial
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Esta pagina consolida as condicoes do periodo gratis, o enquadramento em plano pago e as responsabilidades operacionais aceitas no cadastro da administradora.
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
