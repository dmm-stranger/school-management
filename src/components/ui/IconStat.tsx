import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/utils/tone";
import { TONE_BG_TEXT } from "@/lib/utils/tone";

export function IconStat({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: LucideIcon;
  tone: Tone;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_BG_TEXT[tone]}`}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-lg font-bold text-heading leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted leading-tight">{label}</p>
      </div>
    </div>
  );
}
