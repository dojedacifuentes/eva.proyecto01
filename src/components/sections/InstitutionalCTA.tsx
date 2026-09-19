import { ExternalLink } from '@/components/ui/ExternalLink';
import { sections, site } from '@/content/site';

/**
 * Cierre institucional. El destino sale de `site.contact.href`; mientras esté
 * vacío el botón se muestra desactivado en lugar de apuntar a un dato inventado.
 */
export function InstitutionalCTA() {
  const copy = sections.cta;
  const href = site.contact.href;

  return (
    <section id="contacto" className="section cta" aria-labelledby="contacto-titulo">
      <div className="wrap reveal">
        <p className="eyebrow mono">{copy.eyebrow}</p>
        <h2 id="contacto-titulo" className="cta__title">
          {copy.title}
        </h2>
        <p className="cta__text">{copy.text}</p>
        <ul className="cta__services mono" aria-label="Servicios">
          {copy.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>

        <div className="cta__actions">
          {href ? (
            <ExternalLink href={href} className="btn btn--solid">
              {copy.button}
            </ExternalLink>
          ) : (
            <span className="btn" role="link" aria-disabled="true">
              {copy.button}
            </span>
          )}
          <ExternalLink href={site.social.instagram} className="text-link">
            {copy.secondary}
          </ExternalLink>
        </div>
        {!href && <p className="cta__note">{site.contact.pendingNote}</p>}
      </div>
    </section>
  );
}
