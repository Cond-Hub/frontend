import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  CreditCard,
  FileStack,
  LayoutDashboard,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Users2,
} from 'lucide-react';

import { CondoHomeBrandImage } from '../components/brand/condohome-brand-image';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const whatsappHref = 'https://wa.me/5547992611819';

const navItems = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#solucoes', label: 'Solucoes' },
  { href: '#integracoes', label: 'Integracoes' },
  { href: '#plano', label: 'Plano' },
  { href: '#contato', label: 'Contato' },
];

const featureCards = [
  {
    title: 'Financeiro do condominio',
    description: 'Boletos, comprovacoes e pendencias em uma leitura clara para administradora, sindico e operacao.',
    icon: CreditCard,
  },
  {
    title: 'Comunicacao e avisos',
    description: 'Mensagens importantes, ocorrencias e recados centralizados em uma unica plataforma.',
    icon: BellRing,
  },
  {
    title: 'Moradores e unidades',
    description: 'Cadastro por unidade, bloco e responsavel para dar contexto real a cada rotina do predio.',
    icon: Users2,
  },
  {
    title: 'Documentos e reservas',
    description: 'Arquivos relevantes e agenda das areas comuns com organizacao simples e acesso rapido.',
    icon: FileStack,
  },
  {
    title: 'Mapa operacional',
    description: 'Visualizacao da estrutura do condominio para orientar a equipe sem retrabalho.',
    icon: MapPinned,
  },
  {
    title: 'Painel administrativo',
    description: 'Uma tela viva para acompanhar o que precisa acao, decisao ou acompanhamento no dia.',
    icon: LayoutDashboard,
  },
];

const integrations = [
  'Administradoras',
  'Sindicos',
  'Equipe operacional',
  'Financeiro',
  'Moradores',
];

const planIncludes = [
  'Cadastro de moradores e unidades',
  'Boletos e acompanhamento financeiro',
  'Comunicados, avisos e ocorrencias',
  'Documentos importantes do condominio',
  'Reservas de areas comuns',
  'Contato comercial e implantacao via WhatsApp',
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(40,121,255,0.18),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(58,187,140,0.14),transparent_22%),linear-gradient(180deg,#07111f_0%,#0a1528_42%,#0d1b32_100%)]" />

      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-7 lg:px-10">
        <header className="landing-fade flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-5">
          <Link href="/" className="flex items-center gap-3">
            <CondoHomeBrandImage className="h-12 w-auto object-contain sm:h-14" />
          </Link>

          <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <Button className="rounded-full bg-[#25d366] px-5 text-slate-950 hover:bg-[#1fbd59]">Fale Conosco</Button>
          </a>
        </header>

        <section
          id="inicio"
          className="grid gap-8 py-12 lg:grid-cols-[1.02fr,0.98fr] lg:items-center lg:py-16"
        >
          <div className="landing-fade max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.26em] text-sky-200">Plataforma SaaS para condominios</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              A visao inteligente da administracao condominial.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              CondoHome conecta administradora, sindico, moradores e operacao em uma unica plataforma para acompanhar
              cobranca, comunicacao, documentos, reservas e a rotina do predio com muito mais clareza.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#plano">
                <Button size="lg" className="gap-2 rounded-full bg-white px-7 text-slate-950 hover:bg-slate-200">
                  Conheca o Plano
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full border-white/20 bg-white/5 px-7 text-white hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visibilidade</p>
                <p className="mt-2 text-base font-semibold text-white">Financeiro</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gestao</p>
                <p className="mt-2 text-base font-semibold text-white">Moradores</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rotina</p>
                <p className="mt-2 text-base font-semibold text-white">Reservas</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Central</p>
                <p className="mt-2 text-base font-semibold text-white">Documentos</p>
              </div>
            </div>
          </div>

          <div className="landing-fade landing-float">
            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-[#0f2038] text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Painel CondoHome</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Operacao conectada</h2>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1.08fr,0.92fr]">
                  <div className="rounded-[1.8rem] bg-white p-5 text-slate-950">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Resumo do dia</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Tudo o que importa para o condominio em uma so leitura.</p>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-[1.2rem] bg-slate-100 px-4 py-3 text-sm">Boletos e pendencias atualizados</div>
                      <div className="rounded-[1.2rem] bg-slate-100 px-4 py-3 text-sm">Avisos e ocorrencias centralizados</div>
                      <div className="rounded-[1.2rem] bg-slate-100 px-4 py-3 text-sm">Reservas e documentos acessiveis</div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.8rem] bg-[#153154] p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Financeiro</p>
                      <p className="mt-2 text-lg font-semibold">Cobranca acompanhada com mais contexto.</p>
                    </div>
                    <div className="rounded-[1.8rem] bg-[#102846] p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Comunicacao</p>
                      <p className="mt-2 text-lg font-semibold">Mensagens e rotina sem dispersao.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    Sindico, administradora e operacao na mesma plataforma.
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    Implantacao e conversa comercial feitas direto no WhatsApp.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="quem-somos" className="landing-fade py-8 lg:py-12">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-[2rem] border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quem Somos</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">CondoHome simplifica a gestao do predio inteiro.</h2>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Nossa Missao</p>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  Dar visibilidade real para a operacao condominial, conectando financeiro, moradores, documentos e
                  comunicacao em um fluxo simples.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Nosso Publico</p>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  Administradoras, sindicos e equipes que precisam acompanhar a vida do condominio sem depender de
                  ferramentas desconectadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="solucoes" className="py-10 lg:py-14">
          <div className="landing-fade max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Nossas Solucoes</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
              Ferramentas para transformar a rotina do condominio em um processo mais inteligente e previsivel.
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="landing-fade rounded-[1.8rem] border-white/10 bg-white/5 text-white"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#173154] text-sky-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="integracoes" className="grid gap-6 py-10 lg:grid-cols-[0.95fr,1.05fr] lg:py-14">
          <div className="landing-fade">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Integracoes</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
              CondoHome conecta as partes da operacao que normalmente ficam soltas.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              A plataforma foi pensada para unir os atores do condominio em vez de separar cada rotina em um sistema
              diferente.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {integrations.map((item, index) => (
              <Card
                key={item}
                className="landing-fade rounded-[1.8rem] border-white/10 bg-white/5 text-white"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em]">{item}</h3>
                    <p className="mt-1 text-sm text-slate-300">Fluxo alinhado dentro da mesma experiencia.</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="plano" className="py-10 lg:py-14">
          <Card className="landing-fade overflow-hidden rounded-[2.2rem] border-white/10 bg-white text-slate-950">
            <CardContent className="grid gap-7 p-5 sm:p-6 lg:grid-cols-[0.9fr,1.1fr] lg:p-8">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Nosso Plano</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Um plano unico para contratar sem friccao.</h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Em vez de multiplas faixas e comparativos artificiais, CondoHome concentra a oferta em um unico plano
                  e leva o interessado direto para a conversa comercial no WhatsApp.
                </p>
                <div className="mt-5 rounded-[1.6rem] bg-slate-100 p-5">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Atendimento</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">(47) 99261-1819</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Contrato, implantacao e alinhamento inicial feitos no contato direto.</p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#0f2038] p-5 text-white sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Plano CondoHome</p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Sob consulta</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Unico plano
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {planIncludes.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[1.2rem] bg-white/5 px-4 py-3 text-sm text-slate-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-5 block">
                  <Button size="lg" className="w-full gap-2 rounded-full bg-[#25d366] text-slate-950 hover:bg-[#1fbd59]">
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="contato" className="grid gap-5 py-10 pb-16 lg:grid-cols-[0.9fr,1.1fr] lg:py-14">
          <Card className="landing-fade rounded-[2rem] border-white/10 bg-white/5 text-white">
            <CardContent className="p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Contato</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Fale com a CondoHome</h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Entre em contato para conhecer a plataforma, entender a implantacao e avaliar o encaixe do CondoHome
                para o seu condominio.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="landing-fade rounded-[1.8rem] border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">WhatsApp</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">(47) 99261-1819</p>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-medium text-emerald-300">
                  Abrir conversa →
                </a>
              </CardContent>
            </Card>

            <Card className="landing-fade rounded-[1.8rem] border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Atendimento</p>
                <p className="mt-3 text-base leading-8 text-slate-300">Segunda a sexta, com conversa comercial direta e sem formulario longo.</p>
              </CardContent>
            </Card>

            <Card className="landing-fade rounded-[1.8rem] border-white/10 bg-white/5 text-white sm:col-span-2">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Proxima etapa</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Levar o visitante para uma conversa de verdade.</p>
                </div>
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <Button size="lg" className="gap-2 rounded-full bg-white px-7 text-slate-950 hover:bg-slate-200">
                    Iniciar contato
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
