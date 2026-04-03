import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
  description: 'Simplifique a administracao do seu condominio com ferramentas inteligentes para moradores, sindicos e administradoras. Gestao financeira, reservas, comunicacao e muito mais.',
  keywords: ['gestao condominial', 'condominio', 'administradora', 'sindico', 'moradores', 'SaaS'],
  authors: [{ name: 'CondHub' }],
  icons: {
    icon: '/brand/condohome-mark.png',
  },
  openGraph: {
    title: 'CondHub | Plataforma Completa para Gestao de Condominios',
    description: 'Simplifique a administracao do seu condominio com ferramentas inteligentes.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1220',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
