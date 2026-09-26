import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { site } from '@/content/site';
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

/*
 * Dos tipografías y ninguna más: Space Grotesk para leer y JetBrains Mono para
 * lo que EVA teclea, los rótulos y los bits. El acrónimo de la portada se
 * rasteriza a partir de la primera (antes tenía una tercera, Orbitron).
 *
 * El layout raíz sólo pone el documento, las dos letras y la base de estilos.
 * Lo que rodea a la landing (campo, cabecera, pie, canal) va en `SiteChrome`,
 * que montan la landing y la 404; `/links` no lo carga.
 *
 * `Analytics` cuenta visitas con la estadística de Vercel (sin cookies): cuántas,
 * de dónde llegan —Instagram, por ejemplo— y a qué ruta. Sólo funciona si la
 * estadística está activada en el proyecto de Vercel; en el plan gratuito no
 * cuenta clics.
 */

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
      className={`${grotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
