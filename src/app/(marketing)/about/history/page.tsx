import Image from "next/image";
import { Flag, Building2, GraduationCap, Trophy, School, Star, Users } from "lucide-react";
import { AboutPageShell } from "@/components/about/AboutPageShell";
import { AboutPromoCard } from "@/components/about/AboutPromoCard";
import { IconStat } from "@/components/ui/IconStat";
import { CheckList } from "@/components/ui/CheckList";
import { TONE_BG_TEXT } from "@/lib/utils/tone";
import { HISTORY, ABOUT_HISTORY_PHOTO, ABOUT_PROMO_CARDS } from "@/config/demo-data";

const MILESTONE_ICONS = [Flag, Building2, GraduationCap, Trophy, School, Star];
const GROWTH_ICONS: Record<string, typeof Users> = {
  users: Users,
  graduation: GraduationCap,
  trophy: Trophy,
};

export default function HistoryPage() {
  const promo = ABOUT_PROMO_CARDS.history;

  return (
    <AboutPageShell
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "History" },
      ]}
      promo={
        <AboutPromoCard
          image={promo.image}
          heading={promo.heading}
          description={promo.description}
          ctaLabel={promo.ctaLabel}
        />
      }
    >
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">Our History</h1>
          <div className="grid gap-6 sm:grid-cols-[1fr_260px] items-start mt-4">
            <p className="text-muted">{HISTORY.intro}</p>
            <div className="relative aspect-[16/10] rounded-card overflow-hidden shadow-sm">
              <Image
                src={ABOUT_HISTORY_PHOTO.url}
                alt={ABOUT_HISTORY_PHOTO.alt}
                fill
                className="object-cover grayscale-[40%] sepia-[30%]"
              />
              <span className="absolute bottom-2 left-2 right-2 rounded-control bg-black/50 px-2 py-1 text-[11px] text-white text-center">
                {HISTORY.photoCaption}
              </span>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface shadow-sm p-6 mt-8">
            <h2 className="font-display font-semibold text-heading mb-6">
              Our Journey Through the Years
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {HISTORY.milestones.map((m, i) => {
                const Icon = MILESTONE_ICONS[i];
                return (
                  <div key={m.year} className="text-center">
                    <span
                      className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${TONE_BG_TEXT[m.tone]}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <p className="font-display font-bold text-heading mt-2">{m.year}</p>
                    <p className="text-sm font-medium text-heading mt-1">{m.title}</p>
                    <p className="text-xs text-muted mt-1">{m.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-card bg-primary-light/50 border border-primary/20 p-6 mt-6">
            <h3 className="font-display font-semibold text-heading">
              A Legacy of Learning and Leadership
            </h3>
            <p className="text-sm text-text mt-2 max-w-2xl">{HISTORY.legacyStatement}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-card border border-border bg-surface shadow-sm p-5">
            <h3 className="font-display font-semibold text-heading mb-4">
              Our Growth in Numbers
            </h3>
            <div className="space-y-4">
              {HISTORY.growthStats.map((stat) => (
                <IconStat
                  key={stat.label}
                  icon={GROWTH_ICONS[stat.icon]}
                  tone={stat.tone}
                  value={stat.value}
                  label={stat.label}
                />
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface shadow-sm p-5">
            <h3 className="font-display font-semibold text-heading mb-4">Key Achievements</h3>
            <CheckList items={HISTORY.achievements} tone="success" />
          </div>
        </div>
      </div>
    </AboutPageShell>
  );
}
