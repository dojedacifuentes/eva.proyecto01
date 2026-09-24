import { EvaLogo } from '@/components/brand/EvaLogo';
import { links } from '@/content/links';

/**
 * La puerta secundaria, hacia la landing. Lleva el nombre de EVA (ƎVΛ): el
 * símbolo es del Arcade, arriba; el nombre es del universo que lo contiene.
 */
export function EvaGateway() {
  const { gateway } = links;
  return (
    <section className="arcade-gate" aria-labelledby="arcade-gate-title">
      <EvaLogo id="arcade-gate" pose="logotype" className="arcade-gate__logo" />
      <h2 id="arcade-gate-title" className="arcade-gate__title mono">
        {gateway.title}
      </h2>
      <p className="arcade-gate__text">{gateway.text}</p>
      <a className="arcade-gate__link" href={gateway.href}>
        {gateway.cta}
        <span className="arcade-gate__arrow" aria-hidden="true">
          →
        </span>
      </a>
    </section>
  );
}
