import Image from "next/image";
import { CAMPUS_GALLERY } from "@/config/demo-data";

export function CampusLife() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold text-heading">
          Shaping the Leaders of Tomorrow
        </h2>
        <p className="text-muted mt-3">
          At EduVision School, we believe in empowering every child to reach
          their full potential through academic excellence, character
          building and real-world learning experiences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        {CAMPUS_GALLERY.map((item) => (
          <div key={item.key} className="relative aspect-[4/3] rounded-card overflow-hidden">
            <Image
              src={item.url}
              alt={item.alt}
              width={item.width}
              height={item.height}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-control bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
