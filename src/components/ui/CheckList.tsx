import { Check } from "lucide-react";
import type { Tone } from "@/lib/utils/tone";
import { TONE_TEXT } from "@/lib/utils/tone";

export function CheckList({
  items,
  tone = "primary",
}: {
  items: string[];
  tone?: Tone;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm">
          <Check size={16} className={`shrink-0 mt-0.5 ${TONE_TEXT[tone]}`} aria-hidden="true" />
          <span className="text-text">{item}</span>
        </li>
      ))}
    </ul>
  );
}
