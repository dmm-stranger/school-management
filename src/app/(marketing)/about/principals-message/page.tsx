import Image from "next/image";
import { GraduationCap, Users, ShieldCheck, Globe } from "lucide-react";
import { AboutPageShell } from "@/components/about/AboutPageShell";
import { AboutPromoCard } from "@/components/about/AboutPromoCard";
import { IconFeatureItem } from "@/components/ui/IconFeatureItem";
import { PRINCIPALS_MESSAGE, PRINCIPAL_PHOTO, ABOUT_PROMO_CARDS } from "@/config/demo-data";

const FEATURE_ICONS = [GraduationCap, Users, ShieldCheck, Globe];

export default function PrincipalsMessagePage() {
  const promo = ABOUT_PROMO_CARDS["principals-message"];

  return (
    <AboutPageShell
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Principal's Message" },
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
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">
            Principal&apos;s Message
          </h1>
          <blockquote className="border-l-2 border-primary pl-4 mt-4 text-lg font-display text-primary italic">
            &ldquo;{PRINCIPALS_MESSAGE.quote}&rdquo;
            <footer className="text-sm text-muted mt-1 not-italic">
              — {PRINCIPALS_MESSAGE.quoteAuthor}
            </footer>
          </blockquote>

          <div className="grid gap-6 sm:grid-cols-[220px_1fr] mt-8">
            <div className="relative aspect-square rounded-card overflow-hidden shadow-sm">
              <Image
                src={PRINCIPAL_PHOTO.url}
                alt={PRINCIPAL_PHOTO.alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 text-sm text-text">
              <p className="font-medium text-heading">
                Dear Students, Parents, and Well-wishers,
              </p>
              {PRINCIPALS_MESSAGE.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="pt-2">Warm regards,</p>
              <p className="font-display italic text-xl text-primary">
                {PRINCIPALS_MESSAGE.signOff}
              </p>
              <p className="font-medium text-heading -mt-3">{PRINCIPALS_MESSAGE.signOff}</p>
              <p className="text-muted -mt-3">{PRINCIPALS_MESSAGE.signOffTitle}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface shadow-sm p-5 space-y-5">
          {PRINCIPALS_MESSAGE.features.map((feature, i) => (
            <IconFeatureItem
              key={feature.title}
              icon={FEATURE_ICONS[i]}
              tone={feature.tone}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </AboutPageShell>
  );
}
