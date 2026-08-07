import { Building2, Users, GraduationCap, BookOpen, Trophy, Globe } from "lucide-react";
import { IconStat } from "@/components/ui/IconStat";
import type { Tone } from "@/lib/utils/tone";

const STATS: { icon: typeof Building2; value: string; label: string; tone: Tone }[] = [
  { icon: Building2, value: "20+", label: "Years of Excellence", tone: "primary" },
  { icon: Users, value: "2,500+", label: "Students Enrolled", tone: "success" },
  { icon: GraduationCap, value: "150+", label: "Expert Teachers", tone: "purple" },
  { icon: BookOpen, value: "30+", label: "Academic Programs", tone: "warning" },
  { icon: Trophy, value: "50+", label: "Awards & Recognitions", tone: "danger" },
  { icon: Globe, value: "98%", label: "Parent Satisfaction", tone: "info" },
];

export function StatsBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-12">
      <div className="rounded-card bg-section px-6 py-8 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map((stat) => (
          <IconStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
