
import type { AppProps } from 'next/app';
import '../src/app/globals.css'; // La ruta es relativa al root del proyecto
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div lang="en" suppressHydrationWarning>
      <Head>
        <title>YoPracticando - Find Your Internship</title>
        <meta name="description" content="A platform for students and companies to connect for internships." />
      </Head>
      <div className={cn('min-h-screen bg-background font-body antialiased')}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default MyApp;
