import type { Tone } from "@/lib/utils/tone";
import { TONE_BG_TEXT, TONE_TEXT } from "@/lib/utils/tone";

/**
 * One reusable stat card. Used by the dashboard's 4 top-level stats
 * and the attendance ledger's summary row — previously each had its
 * own near-identical markup.
 */
export function StatCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p
            className={`font-display text-2xl font-semibold mt-1 ${
              tone ? TONE_TEXT[tone] : "text-heading"
            }`}
          >
            {value}
          </p>
        </div>
        {tone && (
          <span
            className={`h-3 w-3 rounded-full mt-1.5 ${TONE_BG_TEXT[tone]}`}
            aria-hidden="true"
          />
        )}
      </div>
      {delta && <p className="text-xs text-success mt-3">{delta}</p>}
    </div>
  );
}
