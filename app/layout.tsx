import type { Metadata } from 'next';
import { ToastViewport } from '../components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'CondoHome',
  description: 'Operacao condominial conectada para administradoras, sindicos e equipes de gestao.',
  icons: {
    icon: '/brand/condohome-mark.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
