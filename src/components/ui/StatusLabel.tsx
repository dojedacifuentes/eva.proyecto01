/**
 * Estado editorial de una sección o de una pieza. Monoespaciada, discreta,
 * con un punto en el color EVA. Nunca se usa para simular contenido.
 */
export function StatusLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="eva-mono inline-flex items-center gap-2 text-muted">
      <span
        aria-hidden="true"
        className="eva-dot size-[5px] shrink-0 rounded-full bg-accent"
      />
      {children}
    </span>
  );
}
