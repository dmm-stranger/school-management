"use client";

import { Menu } from "lucide-react";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-chalk/95 backdrop-blur px-4 py-3 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden rounded-md p-2 hover:bg-chalk-dim"
        aria-label="Open navigation menu"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <p className="font-mono text-xs text-ink-soft tracking-wide">
        {today}
      </p>
    </header>
  );
}
