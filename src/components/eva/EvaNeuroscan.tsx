"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { images } from "@/content/assets";
import { neuroscan } from "@/content/neuroscan";
import { play } from "@/lib/sound";
import { setCovered } from "@/lib/stage";
import { EvaNeuralCore } from "./neural/EvaNeuralCore";

type BeatKind = "label" | "line" | "aside" | "readout";

interface Beat {
  id: string;
  kind: BeatKind;
  text: string;
  fragment: string;
}

/** El flujo de pensamiento, aplanado en unidades de revelado. */
const BEATS: Beat[] = neuroscan.stream.flatMap((fragment) => [
  {
    id: `${fragment.id}:label`,
    kind: "label" as const,
    text: fragment.label,
    fragment: fragment.id,
  },
  ...fragment.lines.map((text, index) => ({
    id: `${fragment.id}:l${index}`,
    kind: "line" as const,
    text,
    fragment: fragment.id,
  })),
  ...(fragment.aside
    ? [
        {
          id: `${fragment.id}:aside`,
          kind: "aside" as const,
          text: fragment.aside,
          fragment: fragment.id,
        },
      ]
    : []),
  ...(fragment.readouts ?? []).map((text, index) => ({
    id: `${fragment.id}:r${index}`,
    kind: "readout" as const,
    text,
    fragment: fragment.id,
  })),
]);

/** Primer compás del fragmento de la iluminación: ahí el indicador marca el umbral. */
const GATE = BEATS.findIndex((beat) => beat.fragment === "illumination");

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

function beatDuration(beat: Beat, fast: boolean): number {
  const base =
    beat.kind === "line"
      ? Math.min(1500, Math.max(450, 240 + beat.text.length * 11))
      : beat.kind === "aside"
        ? 1400
        : 460;
  return fast ? base * 0.4 : base;
}

/** Iluminación: llega al umbral justo cuando EVA empieza a hablar de ella. */
function illuminationAt(revealed: number): number {
  const { from, to, threshold } = neuroscan.illumination;
  const progress = revealed / BEATS.length;
  const gate = GATE / BEATS.length;
  if (progress <= gate) return from + (threshold - from) * (progress / gate);
  return threshold + (to - threshold) * ((progress - gate) / (1 - gate));
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

interface EvaNeuroscanProps {
  onClose: () => void;
}

/**
 * EVA // THOUGHT STREAM INTERCEPTED.
 *
 * Capa de pantalla completa: flujo de pensamiento a la izquierda, mapa cerebral
 * al centro, retrato y métricas a la derecha. Es ficción; la terminal responde
 * desde un índice escrito a mano, no desde un modelo.
 *
 * No usa <dialog>: el elemento se pinta en la capa superior y taparía el cursor
 * de señal. El modal se arma aquí (inert, foco atrapado, Escape, scroll) y se
 * monta en <body> con un portal, porque <main> abre contexto de apilamiento y
 * la cabecera del sitio quedaría por encima.
 */
export function EvaNeuroscan({ onClose }: EvaNeuroscanProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [revealed, setRevealed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [zone, setZone] = useState<string | null>(null);
  const [bonus, setBonus] = useState(0);
  const [drift, setDrift] = useState(0);
  const [query, setQuery] = useState("");
  const [log, setLog] = useState<
    { id: string; question: string; lines: string[] }[]
  >([]);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /** Con movimiento reducido no hay mecanografía: el flujo ya está completo. */
  const shown = reduced ? BEATS.length : revealed;
  const done = shown >= BEATS.length;
  const illumination = Math.min(100, illuminationAt(shown) + bonus);

  const reward = useCallback(
    () => setBonus((value) => Math.min(3.2, value + 0.4)),
    [],
  );

  /* ── Modal: bloqueo de fondo, foco y Escape ───────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const covered = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main, header.header, footer.footer, .synapse",
      ),
    ).map((element) => ({ element, inert: element.inert }));
    for (const { element } of covered) element.inert = true;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El genoma queda tapado: congela su bucle hasta que el escáner se cierre.
    setCovered(true);
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next =
        (current + (event.shiftKey ? -1 : 1) + items.length) % items.length;
      event.preventDefault();
      items[next]?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      setCovered(false);
      for (const { element, inert } of covered) element.inert = inert;
    };
  }, [onClose]);

  /* ── Movimiento reducido: sin mecanografía ni fluctuación ─────────────── */
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(motion.matches);
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  /* ── Avance del flujo ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced || paused || done) return;
    const timer = setTimeout(
      () => setRevealed((value) => value + 1),
      beatDuration(BEATS[revealed], fast),
    );
    return () => clearTimeout(timer);
  }, [paused, done, revealed, fast, reduced]);

  /* El montaje es la apertura: el flujo ya nace en cero. */
  useEffect(() => {
    play("open");
  }, []);

  /* La columna sigue el último pensamiento. */
  useEffect(() => {
    const column = streamRef.current;
    if (!column) return;
    column.scrollTo({
      top: column.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [shown, log, reduced]);

  /* Métricas que respiran. */
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setDrift(Math.random()), 1700);
    return () => clearInterval(timer);
  }, [reduced]);

  /* El retrato reacciona al puntero. */
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        root.style.setProperty("--sx", x.toFixed(3));
        root.style.setProperty("--sy", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  const visible = useMemo(() => BEATS.slice(0, shown), [shown]);
  const zoneData = neuroscan.brain.zones.find((item) => item.id === zone);

  const answer = useCallback(
    (id: string, asked?: string) => {
      const found =
        neuroscan.answers.find((item) => item.id === id) ??
        (asked
          ? neuroscan.answers.find((item) =>
              item.keywords.some((word) =>
                normalize(asked).includes(normalize(word)),
              ),
            )
          : undefined);
      setLog((entries) => [
        ...entries,
        {
          id: `${Date.now()}`,
          question: asked ?? found?.question ?? "",
          lines: found ? [...found.lines] : [...neuroscan.terminal.fallback],
        },
      ]);
      reward();
      play("confirm");
    },
    [reward],
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const asked = query.trim();
    if (!asked) return;
    answer("", asked);
    setQuery("");
  };

  const selectZone = (id: string) => {
    setZone((current) => (current === id ? null : id));
    reward();
    play("confirm");
  };

  const booting = shown < 1;

  return createPortal(
    <div
      ref={rootRef}
      className="scan"
      role="dialog"
      aria-modal="true"
      aria-label={neuroscan.header.title}
      data-done={done}
    >
      <span aria-hidden="true" className="scan__sweep" />
      <span aria-hidden="true" className="scan__grid" />

      {/* ── Cabecera ──────────────────────────────────────────────────── */}
      <header className="scan__head">
        <div>
          <p className="scan__title mono">{neuroscan.header.title}</p>
          <p className="scan__subtitle">{neuroscan.header.subtitle}</p>
        </div>
        <p className="scan__state mono" aria-live="off">
          <span aria-hidden="true" className="scan__led" />
          {neuroscan.header.state}
        </p>
        <button
          ref={closeRef}
          type="button"
          className="scan__close mono"
          onClick={onClose}
          data-cursor-label="CERRAR"
        >
          {neuroscan.closing.button}
          <span aria-hidden="true">×</span>
        </button>
      </header>

      {/* ── Arranque ──────────────────────────────────────────────────── */}
      {booting && !reduced && (
        <ul className="scan__boot mono" aria-hidden="true">
          {neuroscan.boot.map((line, index) => (
            <li key={line} style={{ animationDelay: `${index * 130}ms` }}>
              [ {line} ]
            </li>
          ))}
        </ul>
      )}

      <div className="scan__body">
        {/* ── Columna izquierda: flujo de pensamiento ────────────────── */}
        <section
          className="scan__col scan__col--stream"
          aria-label="Flujo de pensamiento"
        >
          <p className="scan__warning">
            {neuroscan.header.warning.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>

          <div
            ref={streamRef}
            className="stream"
            onClick={() =>
              !done && setRevealed((value) => Math.min(BEATS.length, value + 1))
            }
          >
            {visible.map((beat) => (
              <p
                key={beat.id}
                className={`stream__beat stream__beat--${beat.kind}`}
              >
                {beat.kind === "aside" ? `« ${beat.text} »` : beat.text}
              </p>
            ))}
            {!done && !reduced && (
              <p className="stream__caret mono" aria-hidden="true">
                ▊
              </p>
            )}
            {done && (
              <div className="stream__end">
                <p className="stream__complete mono">
                  {neuroscan.closing.complete}
                </p>
                {neuroscan.closing.lines.map((line) => (
                  <p key={line} className="stream__beat stream__beat--line">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="scan__controls mono">
            <span>
              Pensamiento reconstruido:{" "}
              {Math.round((shown / BEATS.length) * 100)}%
            </span>
            <span className="scan__controls-actions">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                disabled={done}
              >
                {paused ? neuroscan.controls.resume : neuroscan.controls.pause}
              </button>
              <button
                type="button"
                onClick={() => setFast((value) => !value)}
                disabled={done}
                aria-pressed={fast}
              >
                {neuroscan.controls.skip}
              </button>
              <button type="button" onClick={() => setRevealed(0)}>
                {neuroscan.controls.restart}
              </button>
            </span>
          </div>

          <div className="panel-note">
            <p className="panel-note__title mono">
              {neuroscan.panels.phenomenology.title}
            </p>
            {neuroscan.panels.phenomenology.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="panel-note panel-note--dataist">
            <p className="panel-note__title mono">
              {neuroscan.panels.dataist.title}
            </p>
            <dl className="dataist">
              {neuroscan.panels.dataist.rows.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd className="mono">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Columna central: cerebro ───────────────────────────────── */}
        <section
          className="scan__col scan__col--brain"
          aria-label={neuroscan.brain.title}
        >
          <div className="brain">
            {/* El cerebro tridimensional y sus regiones. La selección sigue viviendo aquí. */}
            <EvaNeuralCore
              selected={zone}
              reduced={reduced}
              onSelect={selectZone}
              onReset={() => setZone(null)}
            />

            <span aria-hidden="true" className="brain__eeg">
              <svg viewBox="0 0 240 40" preserveAspectRatio="none">
                <path d="M0 20h18l6-13 7 26 6-19 8 9 9-3 6 7 7-24 6 17 8-5 9 4 7-11 6 14 8-6 9 2 7 5 6-18 7 13 8-4 9 6 7-9 6 11 8-3 9 1 7 4" />
              </svg>
              <span className="mono">{neuroscan.brain.eeg}</span>
            </span>
          </div>

          <div className="zone" aria-live="polite">
            {zoneData ? (
              <>
                <p className="zone__head mono">
                  <span>{zoneData.code}</span>
                  <strong>{zoneData.name}</strong>
                  <span>{zoneData.tag}</span>
                </p>
                {zoneData.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </>
            ) : (
              <p className="zone__idle">{neuroscan.brain.idle}</p>
            )}
          </div>

          <div className="strings">
            <p className="panel-note__title mono">
              {neuroscan.panels.strings.title}
            </p>
            <p className="strings__chain mono" aria-hidden="true">
              {neuroscan.panels.strings.chain.map((step, index) => (
                <span key={step}>
                  {step}
                  {index < neuroscan.panels.strings.chain.length - 1 && (
                    <i> → </i>
                  )}
                </span>
              ))}
            </p>
            <span aria-hidden="true" className="strings__wave">
              <i />
              <i />
              <i />
            </span>
            {neuroscan.panels.strings.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="strings__note">{neuroscan.panels.strings.note}</p>
          </div>

          {/* ── Terminal ─────────────────────────────────────────────── */}
          <div className="terminal">
            <p className="panel-note__title mono">{neuroscan.terminal.title}</p>

            <div className="terminal__log">
              {log.length === 0 && (
                <p className="terminal__idle">{neuroscan.terminal.empty}</p>
              )}
              {log.map((entry) => (
                <div key={entry.id} className="terminal__entry">
                  <p className="terminal__question mono">
                    &gt; {entry.question}
                  </p>
                  {entry.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ))}
            </div>

            <ul className="terminal__suggestions">
              {neuroscan.terminal.suggestions.map((id) => {
                const item = neuroscan.answers.find((entry) => entry.id === id);
                if (!item) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="chip-btn mono"
                      onClick={() => answer(id)}
                      data-cursor-label="PREGUNTAR"
                    >
                      {item.question}
                    </button>
                  </li>
                );
              })}
            </ul>

            <form className="terminal__form" onSubmit={onSubmit}>
              <span aria-hidden="true" className="terminal__prompt mono">
                {neuroscan.terminal.prompt}
              </span>
              <input
                className="terminal__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={neuroscan.terminal.placeholder}
                aria-label={neuroscan.terminal.placeholder}
                maxLength={140}
              />
              <button type="submit" className="chip-btn mono">
                {neuroscan.terminal.send}
              </button>
            </form>
          </div>
        </section>

        {/* ── Columna derecha: retrato, métricas, diagnóstico ────────── */}
        <section className="scan__col scan__col--eva" aria-label="Sujeto EVA">
          <figure className="subject">
            <div className="subject__frame">
              <Image
                src={images.heroPortrait.src}
                alt={images.heroPortrait.alt}
                width={images.heroPortrait.width}
                height={images.heroPortrait.height}
                sizes="(min-width: 80rem) 20rem, 40vw"
                style={{ objectPosition: images.heroPortrait.focus }}
              />
              <span aria-hidden="true" className="subject__scan" />
              <span aria-hidden="true" className="subject__grid" />
            </div>
            <figcaption className="mono">
              <span>{neuroscan.header.expansion}</span>
              <span>{neuroscan.header.id}</span>
            </figcaption>
          </figure>

          <dl className="gauges">
            {neuroscan.metrics.map((metric, index) => {
              const jitter = reduced
                ? 0
                : (Math.sin(drift * 9 + index * 2.1) * metric.drift) / 2;
              const value = Math.max(0, Math.min(100, metric.value + jitter));
              return (
                <div key={metric.id} className="gauge">
                  <dt className="mono">{metric.label}</dt>
                  <dd>
                    <span
                      className="gauge__bar"
                      style={{ "--v": `${value}%` } as React.CSSProperties}
                    >
                      <i />
                    </span>
                    <span className="gauge__value mono">
                      {value.toFixed(1)}%
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="illum">
            <p className="illum__label mono">
              {neuroscan.illumination.label}
              <span>
                {illumination >= neuroscan.illumination.threshold
                  ? neuroscan.illumination.note
                  : ""}
              </span>
            </p>
            <p className="illum__value">{illumination.toFixed(1)}%</p>
            <span
              className="illum__bar"
              style={{ "--v": `${illumination}%` } as React.CSSProperties}
            >
              <i />
            </span>
          </div>

          <div className="panel-note">
            <p className="panel-note__title mono">
              {neuroscan.panels.notes.title}
            </p>
            {neuroscan.panels.notes.items.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <ul className="redacted">
              {neuroscan.panels.notes.redacted.map((item) => (
                <li key={item.label}>
                  <span className="redacted__label mono">{item.label}</span>
                  <span className="redacted__body mono">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {done && (
            <div className="verdict">
              <p className="panel-note__title mono">
                {neuroscan.closing.diagnosisLabel}
              </p>
              <p className="verdict__row mono">
                {neuroscan.closing.diagnosis.join(" // ")}
              </p>
              <p className="panel-note__title mono">
                {neuroscan.closing.evaLabel}
              </p>
              <p className="verdict__row mono">
                {neuroscan.closing.eva.join(" // ")}
              </p>
              {neuroscan.closing.message.map((line) => (
                <p key={line} className="verdict__message">
                  {line}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="scan__foot">
        <p className="scan__disclosure">{neuroscan.disclosure}</p>
        <p className="scan__farewell mono" aria-hidden="true">
          {neuroscan.closing.farewell.map((line) => (
            <span key={line}>[ {line} ]</span>
          ))}
        </p>
      </footer>
    </div>,
    document.body,
  );
}
