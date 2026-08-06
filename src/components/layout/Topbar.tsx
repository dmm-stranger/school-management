"use client";

import Image from "next/image";
import { Menu, Search, Bell, MessageSquare } from "lucide-react";
import { CURRENT_ADMIN_AVATAR } from "@/config/demo-data";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-surface/95 backdrop-blur px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden rounded-control p-2 hover:bg-section"
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <label className="hidden sm:flex items-center gap-2 rounded-control border border-border bg-section px-3 py-1.5 text-sm text-muted w-64">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none w-full placeholder:text-muted-text"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:block font-sans text-xs text-muted">
          {today}
        </span>
        <button
          type="button"
          className="rounded-control p-2 hover:bg-section text-muted"
          aria-label="Messages"
        >
          <MessageSquare size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="rounded-control p-2 hover:bg-section text-muted"
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Image
            src={CURRENT_ADMIN_AVATAR.url}
            alt={CURRENT_ADMIN_AVATAR.alt}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-heading">John Doe</p>
            <p className="text-xs text-muted">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
