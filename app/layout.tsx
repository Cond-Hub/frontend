import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MessageCircle } from 'lucide-react';
import { ThemeSync } from '../components/theme/theme-sync';
import { ToastViewport } from '../components/ui/toast';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'CondHub | Plataforma Completa para Gestao de Condominios',
  description: 'Simplifique a gestao da sua empresa e das operacoes dos condominios com ferramentas para gestores, sindicos, moradores e cobranca.',
  keywords: ['gestao condominial', 'condominio', 'empresa gestora', 'sindico', 'moradores'],
  authors: [{ name: 'CondHub' }],
  icons: {
    icon: '/brand/condohome-mark.png',
  },
  openGraph: {
    title: 'CondHub | Plataforma Completa para Gestao de Condominios',
    description: 'Simplifique a gestao da sua empresa e das operacoes dos condominios com ferramentas inteligentes.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1220',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsappHref =
    'https://wa.me/5547992611819?text=' + encodeURIComponent('Olá, vim procurar suporte para o CondHub!');

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeSync />
        {children}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar com o suporte no WhatsApp"
          title="Falar com o suporte no WhatsApp"
          className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#1fba59] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        <ToastViewport />
      </body>
    </html>
  );
}
