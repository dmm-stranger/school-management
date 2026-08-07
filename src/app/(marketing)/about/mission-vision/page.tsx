import Image from "next/image";
import { Target, Eye, ShieldCheck, Users, Award, Star, Heart } from "lucide-react";
import { AboutPageShell } from "@/components/about/AboutPageShell";
import { AboutPromoCard } from "@/components/about/AboutPromoCard";
import { CheckList } from "@/components/ui/CheckList";
import { IconFeatureItem } from "@/components/ui/IconFeatureItem";
import { MISSION_VISION, ABOUT_BUILDING_IMAGE, ABOUT_PROMO_CARDS } from "@/config/demo-data";

const VALUE_ICONS = [ShieldCheck, Users, Award, Star, Heart];

export default function MissionVisionPage() {
  const promo = ABOUT_PROMO_CARDS["mission-vision"];

  return (
    <AboutPageShell
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Mission & Vision" },
      ]}
      promo={
        <AboutPromoCard
          icon="target"
          heading={promo.heading}
          description={promo.description}
          ctaLabel={promo.ctaLabel}
        />
      }
    >
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">Mission & Vision</h1>
          <p className="text-muted mt-4 max-w-2xl">{MISSION_VISION.intro}</p>

          <div className="grid gap-6 sm:grid-cols-2 mt-8">
            <div className="rounded-card bg-success/5 border border-success/20 p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <Target size={26} aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold text-success mt-4 border-b border-success/30 pb-3 inline-block">
                {MISSION_VISION.mission.title}
              </h2>
              <p className="text-sm text-muted mt-3">{MISSION_VISION.mission.statement}</p>
              <div className="mt-4">
                <CheckList items={MISSION_VISION.mission.points} tone="success" />
              </div>
            </div>

            <div className="rounded-card bg-purple/5 border border-purple/20 p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 text-purple">
                <Eye size={26} aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold text-purple mt-4 border-b border-purple/30 pb-3 inline-block">
                {MISSION_VISION.vision.title}
              </h2>
              <p className="text-sm text-muted mt-3">{MISSION_VISION.vision.statement}</p>
              <div className="mt-4">
                <CheckList items={MISSION_VISION.vision.points} tone="info" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-sm">
            <Image
              src={ABOUT_BUILDING_IMAGE.url}
              alt={ABOUT_BUILDING_IMAGE.alt}
              fill
              className="object-cover"
            />
          </div>
          <div className="rounded-card border border-border bg-surface shadow-sm p-5">
            <h3 className="font-display font-semibold text-heading mb-4">Our Core Values</h3>
            <div className="space-y-4">
              {MISSION_VISION.coreValues.map((value, i) => (
                <IconFeatureItem
                  key={value.title}
                  icon={VALUE_ICONS[i]}
                  tone={value.tone}
                  title={value.title}
                  description={value.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AboutPageShell>
  );
}
