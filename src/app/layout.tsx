import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  DEFAULT_THEME,
  THEME_COLOR,
  THEME_SCRIPT,
} from '@/components/theme/theme';
import { identity, seo } from '@/data/eva';
import { siteUrl } from '@/lib/site';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  // Con esto, cada ruta relativa de la metadata —la imagen de vista previa
  // incluida— se resuelve a una URL absoluta. Sin ello, los previsualizadores
  // de WhatsApp, Instagram o Slack no encuentran la imagen.
  metadataBase: new URL(siteUrl),
  title: { default: seo.title, template: `%s — ${identity.name}` },
  description: seo.description,
  applicationName: identity.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: '/',
    siteName: identity.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR[DEFAULT_THEME],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-CL"
      // El modo oscuro llega ya resuelto desde el servidor: sin JavaScript el
      // sitio es oscuro, y el script en línea sólo corrige a claro si el
      // visitante lo eligió antes. En ningún caso hay flash.
      data-theme={DEFAULT_THEME}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a
          href="#contenido"
          className="eva-mono sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-eva focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Saltar al contenido
        </a>
        <div aria-hidden="true" className="eva-atmosphere" />
        <div className="relative z-10">
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
