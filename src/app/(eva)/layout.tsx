import { SiteChrome } from '@/components/layout/SiteChrome';

/**
 * La landing con todo lo que la rodea. El grupo `(eva)` no cambia la URL: la
 * portada sigue en `/`; sólo separa lo que `/links` no necesita.
 */
export default function EvaLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
