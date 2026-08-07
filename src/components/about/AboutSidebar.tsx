"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import { ABOUT_NAV_ITEMS } from "@/config/demo-data";

export function AboutSidebar({ promo }: { promo?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="space-y-4">
      <nav className="rounded-card border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-secondary text-white px-4 py-3">
          <span className="flex items-center gap-2 font-medium text-sm">
            <Users size={16} aria-hidden="true" /> About Us
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </div>
        <ul className="py-1">
          {ABOUT_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    isActive
                      ? "bg-primary-light text-primary font-medium"
                      : "text-text hover:bg-section"
                  }`}
                >
                  {item.label}
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {promo}
    </aside>
  );
}
