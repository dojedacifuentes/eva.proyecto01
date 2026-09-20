import { CodaStatus } from '@/components/eva/consciencia/CodaStatus';
import { ConsciousnessExperience } from '@/components/eva/consciencia/ConsciousnessExperience';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { consciencia } from '@/content/consciencia';
import { site } from '@/content/site';
import { axisById, axisMottos, home, structureLabels } from '@/content/structure';
import { NodeHead } from './NodeParts';

/**
 * 10 · Consciencia. Después del inventario del cuerpo —una bomba, conductos,
 * impulsos— viene la pregunta que el inventario no contesta: quién lo habita.
 * Es un eje sin partes: un solo lugar, en dos slides.
 *
 *   1. EL CAMPO — a la derecha, un campo de partículas (Particle Life, MIT,
 *      adaptado) que EVA observa organizarse: se perturba con el puntero, se
 *      reúne en una figura (ojo, espiral, laberinto, doble, nombre), se le
 *      cambian las reglas (caos), el ruido, la gravedad y la viscosidad. A la
 *      izquierda, la cabecera del lugar con el puente desde el corazón, la
 *      caja donde EVA escribe y la consola. Cada acción cambia lo que EVA dice.
 *   2. EL CIERRE — un silencio: un registro que cambia una sola vez
 *      (`ESTADO: EXPANSIÓN` → `ESTADO: ALGUIEN ESTUVO AQUÍ`), el enlace para
 *      continuar la conversación fuera y la vuelta al inicio.
 *
 * El corazón (01.11) queda como estaba: la conexión con él es sólo narrativa,
 * por el pie de su último slide y por el `lede` de esta cabecera. Es ficción
 * declarada: organizar partículas no demuestra consciencia y nada se registra.
 */
export function ConscienciaSection() {
  const copy = consciencia;
  const axis = axisById('consciencia');
  const code = axis?.code;
  const name = axis?.name.toUpperCase();
  /* El destino se identifica por su nombre de usuario, sacado del único enlace verificado. */
  const handle = new URL(site.social.instagram).pathname.replaceAll('/', '');

  return (
    <section
      id="consciencia"
      className="section node node--consciencia"
      aria-labelledby="consciencia-titulo"
      data-accent={axis?.accent}
    >
      <div className="slide conscience__slide">
        <div className="wrap">
          <ConsciousnessExperience
            head={
              <NodeHead
                id="consciencia"
                eyebrow={`${axis?.name} — ${axisMottos.consciencia}`}
                title={copy.title}
                lede={copy.bridge}
              />
            }
            copy={<EvaWrites id="consciencia" place={`${code} · ${name}`} blocks={copy.writes} />}
            foot={
              /* Con clave: llega del servidor y se coloca en una lista de hijos (trampa 29). */
              <p key="fiction" className="genome__fiction mono">
                {copy.fiction}
              </p>
            }
          />

          {/* El pie del último lugar lleva al cierre, no a otro lugar. */}
          <p className="slide__foot mono">
            <span aria-hidden="true">
              <b data-bin="">{code}</b> {structureLabels.of} <span data-bin="">{code}</span>
            </span>
            <a href="#consciencia-cierre" data-sound="open">
              {copy.foot.next} <span aria-hidden="true">↓</span>
            </a>
          </p>
        </div>
      </div>

      {/* El cierre: un silencio, un registro que cambia una vez y dos salidas. */}
      <div className="slide conscience-coda" id="consciencia-cierre">
        <div className="wrap conscience-coda__inner">
          <p className="eyebrow mono conscience-coda__eyebrow">{copy.coda.eyebrow}</p>
          {copy.coda.whisper && <p className="conscience-coda__whisper">{copy.coda.whisper}</p>}
          <span className="conscience-coda__silence" aria-hidden="true" />
          <CodaStatus
            label={copy.coda.statusLabel}
            before={copy.coda.before}
            after={copy.coda.after}
            afterMs={copy.coda.flipAfterMs}
          />
          <p className="conscience-coda__links">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="conscience-coda__continue"
              data-cursor="external"
            >
              {copy.coda.continue} <span aria-hidden="true">↗</span>
            </a>
            <span className="conscience-coda__tag mono">
              INSTAGRAM · @{handle} · {copy.coda.continueHint}
            </span>
            <a href={home.href} className="conscience-coda__back mono" data-sound="open">
              {copy.coda.back} <span aria-hidden="true">↑</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
