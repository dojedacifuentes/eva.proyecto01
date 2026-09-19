import { statusLabel } from '@/lib/content';
import type { ContentStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className="badge mono" data-status={status}>
      {statusLabel[status]}
    </span>
  );
}
