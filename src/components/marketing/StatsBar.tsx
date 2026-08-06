import { Building2, Users, GraduationCap, BookOpen, Trophy, Globe } from "lucide-react";
import { TONE_BG_TEXT } from "@/lib/utils/tone";

const STATS = [
  { icon: Building2, value: "20+", label: "Years of Excellence", tone: "primary" as const },
  { icon: Users, value: "2,500+", label: "Students Enrolled", tone: "success" as const },
  { icon: GraduationCap, value: "150+", label: "Expert Teachers", tone: "purple" as const },
  { icon: BookOpen, value: "30+", label: "Academic Programs", tone: "warning" as const },
  { icon: Trophy, value: "50+", label: "Awards & Recognitions", tone: "danger" as const },
  { icon: Globe, value: "98%", label: "Parent Satisfaction", tone: "info" as const },
];

export function StatsBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-12">
      <div className="rounded-card bg-section px-6 py-8 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_BG_TEXT[stat.tone]}`}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-heading leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
