import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/toaster';
import {AppShell} from '@/components/app-shell';
import {TransactionsProvider} from '@/hooks/use-transactions';

const inter = Inter({subsets: ['latin'], variable: '--font-inter'});

export const metadata: Metadata = {
  title: 'Zenith Finance',
  description: 'Seu controle financeiro pessoal, simplificado.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TransactionsProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </TransactionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
