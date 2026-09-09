/**
 * Marca de EVA: cuadrado de esquinas suaves con el triángulo de reproducción,
 * en el color EVA. Es el único elemento gráfico de la identidad; todo lo demás
 * lo construye la tipografía.
 */
export function EvaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="0.75"
        y="0.75"
        width="18.5"
        height="18.5"
        rx="4"
        fill="none"
        stroke="var(--eva-accent)"
        strokeWidth="1.5"
      />
      <path d="M8 6.4 14 10 8 13.6Z" fill="var(--eva-accent)" />
    </svg>
  );
}
