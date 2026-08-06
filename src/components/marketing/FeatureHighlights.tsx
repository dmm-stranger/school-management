import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  Trophy,
  Heart,
  ArrowRight,
} from "lucide-react";
import { TONE_BG_TEXT } from "@/lib/utils/tone";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    description: "High standards of academic excellence and innovation.",
    tone: "primary" as const,
  },
  {
    icon: Users,
    title: "Experienced Faculty",
    description: "Dedicated educators focused on student success.",
    tone: "success" as const,
  },
  {
    icon: Building2,
    title: "Modern Campus",
    description: "State-of-the-art facilities for holistic development.",
    tone: "purple" as const,
  },
  {
    icon: Trophy,
    title: "Holistic Development",
    description: "Encouraging creativity, leadership and critical thinking.",
    tone: "warning" as const,
  },
  {
    icon: Heart,
    title: "Values & Character",
    description: "Building strong values and responsible global citizens.",
    tone: "danger" as const,
  },
];

export function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-6 -mt-8 relative z-10">
      <div className="rounded-card bg-surface border border-border shadow-md p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title}>
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full mb-3 ${TONE_BG_TEXT[feature.tone]}`}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="font-display font-semibold text-heading">
                {feature.title}
              </h3>
              <p className="text-sm text-muted mt-1">{feature.description}</p>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-2 hover:text-primary-hover"
              >
                Learn More
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
