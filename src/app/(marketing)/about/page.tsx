import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, Users, Trophy, type LucideIcon } from "lucide-react";
import { AboutPageShell } from "@/components/about/AboutPageShell";
import { IconStat } from "@/components/ui/IconStat";
import { CheckList } from "@/components/ui/CheckList";
import { ABOUT_OVERVIEW, ABOUT_BUILDING_IMAGE } from "@/config/demo-data";

const STAT_ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  users: Users,
  trophy: Trophy,
};

export default function AboutPage() {
  return (
    <AboutPageShell
      breadcrumbItems={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      promo={
        <div className="rounded-card border border-border bg-surface shadow-sm p-5">
          <h3 className="font-display font-semibold text-heading mb-3">
            Why Choose EduVision?
          </h3>
          <CheckList items={ABOUT_OVERVIEW.whyChoose} />
          <Link
            href="/admissions"
            className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-control bg-heading px-4 py-2.5 text-sm font-medium text-white hover:bg-secondary transition-colors"
          >
            Enquire Now
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">
            About EduVision School
          </h1>
          <p className="text-muted mt-4">{ABOUT_OVERVIEW.intro}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
            {ABOUT_OVERVIEW.stats.map((stat) => (
              <IconStat
                key={stat.label}
                icon={STAT_ICONS[stat.icon]}
                tone={stat.tone}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-sm">
          <Image
            src={ABOUT_BUILDING_IMAGE.url}
            alt={ABOUT_BUILDING_IMAGE.alt}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl font-bold text-heading border-b border-border pb-3 mb-6">
          Explore About Us
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_OVERVIEW.exploreCards.map((card) => (
            <Link
              key={card.slug}
              href={`/about/${card.slug}`}
              className="rounded-card border border-border bg-surface shadow-sm p-5 hover:border-primary transition-colors"
            >
              <h3 className="font-display font-semibold text-heading">{card.title}</h3>
              <p className="text-sm text-muted mt-2">{card.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3">
                Read More <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AboutPageShell>
  );
}
