import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { HERO_IMAGE, TRUST_AVATARS } from "@/config/demo-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/60 via-primary-light/20 to-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-warning mb-3">Welcome to</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-heading leading-tight">
            EduVision School
          </h1>
          <p className="font-display text-xl sm:text-2xl font-semibold text-primary mt-3">
            Nurturing Minds, Inspiring Futures
          </p>
          <p className="text-text mt-4 max-w-md">
            We provide a world-class education that empowers students to
            become confident, compassionate, and responsible global citizens.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Discover More
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-6 py-3 text-sm font-medium text-primary hover:bg-section transition-colors"
            >
              Apply for Admission
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-7">
            <div className="flex -space-x-3">
              {TRUST_AVATARS.map((avatar) => (
                <Image
                  key={avatar.alt}
                  src={avatar.url}
                  alt={avatar.alt}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-surface"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
                ))}
                <span className="text-sm font-medium text-heading ml-1">4.8/5</span>
              </div>
              <p className="text-xs text-muted">Trusted by 2,500+ Parents</p>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-md">
          <Image
            src={HERO_IMAGE.url}
            alt={HERO_IMAGE.alt}
            width={HERO_IMAGE.width}
            height={HERO_IMAGE.height}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
