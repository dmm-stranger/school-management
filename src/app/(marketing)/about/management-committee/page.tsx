import Image from "next/image";
import NextLink from "next/link";
import { ShieldCheck, Headphones, ArrowRight } from "lucide-react";
import { AboutPageShell } from "@/components/about/AboutPageShell";
import { AboutPromoCard } from "@/components/about/AboutPromoCard";
import { CheckList } from "@/components/ui/CheckList";
import { MANAGEMENT_COMMITTEE_PAGE, COMMITTEE_MEMBERS, ABOUT_PROMO_CARDS } from "@/config/demo-data";

export default function ManagementCommitteePage() {
  const promo = ABOUT_PROMO_CARDS["management-committee"];

  return (
    <AboutPageShell
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Management Committee" },
      ]}
      promo={
        <AboutPromoCard
          image={promo.image}
          heading={promo.heading}
          description={promo.description}
          ctaLabel={promo.ctaLabel}
          ctaHref="/contact"
        />
      }
    >
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">
            Management Committee
          </h1>
          <p className="text-muted mt-4 max-w-2xl">{MANAGEMENT_COMMITTEE_PAGE.intro}</p>

          <h2 className="font-display font-semibold text-heading mt-8 mb-4">
            Committee Members
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COMMITTEE_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="rounded-card border border-border bg-surface shadow-sm p-4 text-center"
              >
                <div className="relative h-20 w-20 mx-auto rounded-full overflow-hidden">
                  <Image src={member.avatar.url} alt={member.avatar.alt} fill className="object-cover" />
                </div>
                <p className="font-medium text-heading mt-3">{member.name}</p>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                <p className="text-xs text-muted mt-1">{member.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-card bg-primary-light/50 border border-primary/20 p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold text-heading">
              <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
              Our Commitment
            </h3>
            <p className="text-sm text-text mt-2">
              The Management Committee is committed to maintaining the highest standards of
              education, transparency and ethical governance.
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface shadow-sm p-5">
            <h3 className="font-display font-semibold text-heading mb-4">
              Key Responsibilities
            </h3>
            <CheckList items={MANAGEMENT_COMMITTEE_PAGE.responsibilities} />
          </div>

          <div className="rounded-card border border-border bg-surface shadow-sm p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold text-heading">
              <Headphones size={18} className="text-primary" aria-hidden="true" />
              Have Questions?
            </h3>
            <p className="text-sm text-muted mt-2">
              We are here to help you learn more about our leadership and vision.
            </p>
            <NextLink
              href="/contact"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-control border border-border px-4 py-2.5 text-sm font-medium text-primary hover:bg-section transition-colors"
            >
              Contact Us
              <ArrowRight size={15} aria-hidden="true" />
            </NextLink>
          </div>
        </div>
      </div>
    </AboutPageShell>
  );
}
