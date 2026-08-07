import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target } from "lucide-react";
import type { DemoImage } from "@/config/demo-data";

export function AboutPromoCard({
  image,
  icon = "target",
  heading,
  description,
  ctaLabel,
  ctaHref = "/admissions",
}: {
  image?: DemoImage;
  icon?: "target";
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface shadow-sm overflow-hidden">
      {image ? (
        <div className="relative aspect-[16/10]">
          <Image src={image.url} alt={image.alt} fill className="object-cover" />
        </div>
      ) : (
        <div className="pt-6 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            {icon === "target" && <Target size={28} aria-hidden="true" />}
          </span>
        </div>
      )}
      <div className="p-5 text-center">
        <h3 className="font-display font-semibold text-heading">{heading}</h3>
        <p className="text-sm text-muted mt-2">{description}</p>
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-control bg-heading px-4 py-2.5 text-sm font-medium text-white hover:bg-secondary transition-colors"
        >
          {ctaLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
