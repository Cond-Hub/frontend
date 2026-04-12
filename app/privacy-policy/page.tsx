import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: '1. Informacoes gerais',
    body:
      'A CondHub disponibiliza aplicativo e plataforma web para gestao de condominios, comunicacao operacional, ocorrencias, reservas, documentos, agenda e cobranca. Esta politica descreve como dados pessoais e permissoes do dispositivo podem ser utilizados.',
  },
  {
    title: '2. Dados que podem ser tratados',
    body:
      'Podemos tratar dados de identificacao e contato, dados de acesso, unidade vinculada, informacoes operacionais do condominio, anexos enviados em ocorrencias, documentos disponibilizados ao usuario e dados tecnicos necessarios para autenticacao, seguranca e funcionamento do app.',
  },
  {
    title: '3. Permissao de camera',
    body:
      'A permissao de camera e utilizada apenas quando o usuario escolhe tirar uma foto dentro do aplicativo, especialmente para anexar imagens em ocorrencias. A camera nao e ativada em segundo plano e nao e usada sem acao direta do usuario.',
  },
  {
    title: '4. Permissao de notificacoes',
    body:
      'A permissao de notificacoes pode ser usada para avisos operacionais, atualizacoes sobre ocorrencias, reservas, boletos, lembretes e comunicacoes relevantes do condominio. O usuario pode negar essa permissao ou revoga-la nas configuracoes do dispositivo.',
  },
  {
    title: '5. Compartilhamento',
    body:
      'Os dados podem ser compartilhados apenas com operadores necessarios para hospedagem, notificacoes push, armazenamento e processamento da plataforma, sempre dentro do escopo necessario para prestacao do servico, seguranca, cumprimento de obrigacoes legais ou execucao da relacao contratual.',
  },
  {
    title: '6. Armazenamento e seguranca',
    body:
      'Adotamos medidas tecnicas e administrativas razoaveis para proteger os dados contra acesso nao autorizado, perda, alteracao ou divulgacao indevida. Os dados sao mantidos pelo tempo necessario para operacao da plataforma, cumprimento legal e defesa de direitos.',
  },
  {
    title: '7. Direitos do titular',
    body:
      'O titular pode solicitar confirmacao de tratamento, acesso, correcao, anonimização quando aplicavel, portabilidade, informacoes sobre compartilhamento e revisao de consentimentos, observadas as hipoteses legais e contratuais aplicaveis.',
  },
  {
    title: '8. Contato',
    body:
      'Para assuntos relacionados a privacidade, protecao de dados ou uso de permissoes do aplicativo, entre em contato pelos canais oficiais da CondHub informados no site ou no relacionamento comercial da plataforma.',
  },
  {
    title: '9. Atualizacoes desta politica',
    body:
      'Esta politica pode ser atualizada para refletir mudancas operacionais, legais ou regulatorias. A versao publicada nesta pagina deve ser considerada a referencia vigente.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="dark">
      <main className="min-h-screen bg-background text-foreground">
        <LandingNavbar />

        <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(250,204,21,0.1),transparent_20%)]">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Politica de Privacidade
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Uso de dados, notificacoes e camera no CondHub
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Esta pagina pode ser utilizada como URL publica de politica de privacidade para distribuicao do aplicativo,
              incluindo publicacao na Google Play. Ultima atualizacao: 12/04/2026.
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
