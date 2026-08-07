import type { LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/utils/tone";
import { TONE_BG_TEXT } from "@/lib/utils/tone";

export function IconFeatureItem({
  icon: Icon,
  tone,
  title,
  description,
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_BG_TEXT[tone]}`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-heading">{title}</p>
        <p className="text-sm text-muted mt-0.5">{description}</p>
      </div>
    </div>
  );
}
