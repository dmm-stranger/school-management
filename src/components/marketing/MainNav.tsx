"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { LOGO_SVG_PATH, ABOUT_NAV_ITEMS } from "@/config/demo-data";

const NAV_LINKS: { label: string; href: string; dropdown?: { label: string; href: string }[] }[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    dropdown: ABOUT_NAV_ITEMS.map((item) => ({ label: item.label, href: item.href })),
  },
  {
    label: "Academics",
    href: "/academics",
    dropdown: [
      { label: "Curriculum", href: "/academics" },
      { label: "Primary School", href: "/academics" },
      { label: "Middle School", href: "/academics" },
      { label: "High School", href: "/academics" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    dropdown: [
      { label: "How to Apply", href: "/admissions" },
      { label: "Fees & Scholarships", href: "/admissions" },
      { label: "FAQs", href: "/admissions" },
    ],
  },
  {
    label: "Campus Life",
    href: "/campus-life",
    dropdown: [
      { label: "Sports", href: "/campus-life" },
      { label: "Library", href: "/campus-life" },
      { label: "Events", href: "/campus-life" },
    ],
  },
  {
    label: "News & Events",
    href: "/news",
    dropdown: [
      { label: "Latest News", href: "/news" },
      { label: "Upcoming Events", href: "/news" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
];

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src={LOGO_SVG_PATH} alt="EduVision School logo" width={40} height={40} />
          <span>
            <span className="block font-display text-lg font-semibold text-heading leading-tight">
              EduVision School
            </span>
            <span className="block text-xs text-muted leading-tight">
              Nurturing Minds, Inspiring Futures
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <div key={link.label} className="group relative">
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 text-sm font-medium py-2 ${
                    active ? "text-primary" : "text-text hover:text-primary"
                  } transition-colors`}
                >
                  {link.label}
                  {link.dropdown && (
                    <ChevronDown
                      size={14}
                      className="transition-transform group-hover:rotate-180"
                      aria-hidden="true"
                    />
                  )}
                </Link>
                {active && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}

                {link.dropdown && (
                  <div className="absolute left-0 top-full hidden group-hover:block pt-2 z-40">
                    <ul className="min-w-52 rounded-card border border-border bg-surface shadow-md py-2">
                      {link.dropdown.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="block px-4 py-2 text-sm text-text hover:bg-section hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Login Portal
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-control p-2 text-heading hover:bg-section"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border px-6 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-control px-3 py-2.5 text-sm font-medium ${
                    isLinkActive(link.href)
                      ? "bg-primary-light text-primary"
                      : "text-text hover:bg-section"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-white"
          >
            Login Portal
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
