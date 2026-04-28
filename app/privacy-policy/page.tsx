import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: '1. Informações gerais',
    body:
      'A CondHub disponibiliza aplicativo e plataforma web para gestão de condomínios, comunicação operacional, ocorrências, reservas, documentos, agenda e cobrança. Esta política descreve como dados pessoais e permissões do dispositivo podem ser utilizados.',
  },
  {
    title: '2. Dados que podem ser tratados',
    body:
      'Podemos tratar dados de identificação e contato, dados de acesso, unidade vinculada, informações operacionais do condomínio, anexos enviados em ocorrências, documentos disponibilizados ao usuário e dados técnicos necessários para autenticação, segurança e funcionamento do app.',
  },
  {
    title: '3. Permissão de câmera',
    body:
      'A permissão de câmera é utilizada apenas quando o usuário escolhe tirar uma foto dentro do aplicativo, especialmente para anexar imagens em ocorrências. A câmera não é ativada em segundo plano e não é usada sem ação direta do usuário.',
  },
  {
    title: '4. Permissão de notificações',
    body:
      'A permissão de notificações pode ser usada para avisos operacionais, atualizações sobre ocorrências, reservas, boletos, lembretes e comunicações relevantes do condomínio. O usuário pode negar essa permissão ou revoga-la nas configurações do dispositivo.',
  },
  {
    title: '5. Compartilhamento',
    body:
      'Os dados podem ser compartilhados apenas com operadores necessários para hospedagem, notificações push, armazenamento e processamento da plataforma, sempre dentro do escopo necessário para prestação do serviço, segurança, cumprimento de obrigações legais ou execução da relação contratual.',
  },
  {
    title: '6. Armazenamento e segurança',
    body:
      'Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado, perda, alteração ou divulgação indevida. Os dados são mantidos pelo tempo necessário para operação da plataforma, cumprimento legal e defesa de direitos.',
  },
  {
    title: '7. Direitos do titular',
    body:
      'O titular pode solicitar confirmação de tratamento, acesso, correção, anonimização quando aplicável, portabilidade, informações sobre compartilhamento e revisão de consentimentos, observadas as hipóteses legais e contratuais aplicáveis.',
  },
  {
    title: '8. Contato',
    body:
      'Para assuntos relacionados a privacidade, proteção de dados ou uso de permissões do aplicativo, entre em contato pelos canais oficiais da CondHub informados no site ou no relacionamento comercial da plataforma.',
  },
  {
    title: '9. Atualizações desta política',
    body:
      'Esta política pode ser atualizada para refletir mudanças operacionais, legais ou regulatórias. A versão publicada nesta página deve ser considerada a referência vigente.',
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
              Política de Privacidade
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Uso de dados, notificações e câmera no CondHub
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Esta página pode ser utilizada como URL pública de política de privacidade para distribuição do aplicativo,
              incluindo publicação na Google Play. Última atualização: 12/04/2026.
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
