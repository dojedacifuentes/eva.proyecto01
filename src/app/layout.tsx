import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Orbitron, Space_Grotesk } from 'next/font/google';
import './globals.css';
import './interface.css';
import './neuroscan.css';
import './dna.css';
import { EvaField } from '@/components/eva/EvaField';
import { EvaThoughtStream } from '@/components/eva/EvaThoughtStream';
import { ScrollReveal } from '@/components/eva/ScrollReveal';
import { EvaSignalCursor } from '@/components/eva/EvaSignalCursor';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { flags, nav, site } from '@/content/site';
import { siteUrl } from '@/lib/site';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/** Sólo para el acrónimo del hero: tres letras, tipografía de display. */
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.seo.title,
  description: site.seo.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: '/',
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#020407',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CL"
      className={`${grotesk.variable} ${jetbrains.variable} ${orbitron.variable}`}
    >
      <body>
        <a href="#contenido" className="skip-link sr-only-focusable mono">
          {nav.skip}
        </a>

        {/* Capas decorativas: detrás del contenido y sin capturar eventos. */}
        <EvaField particles={flags.reactiveField} />
        {flags.signalCursor && <EvaSignalCursor />}

        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
        <EvaThoughtStream />
        <ScrollReveal />
      </body>
    </html>
  );
}
