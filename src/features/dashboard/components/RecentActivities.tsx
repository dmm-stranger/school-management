import Link from "next/link";
import { UserPlus, Wallet, BookOpen, Megaphone } from "lucide-react";
import { RECENT_ACTIVITIES } from "@/config/demo-data";
import { TONE_BG_TEXT } from "@/lib/utils/tone";

const ICONS = [UserPlus, Wallet, BookOpen, Megaphone];

export function RecentActivities() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm h-full flex flex-col">
      <h3 className="font-display font-semibold text-heading mb-4">
        Recent Activities
      </h3>
      <ul className="flex-1 space-y-4">
        {RECENT_ACTIVITIES.map((activity, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={activity.title} className="flex items-start gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_BG_TEXT[activity.tone]}`}
              >
                <Icon size={15} aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-heading">{activity.title}</p>
                <p className="text-xs text-muted truncate">{activity.detail}</p>
              </div>
              <span className="text-xs text-muted-text shrink-0">{activity.time}</span>
            </li>
          );
        })}
      </ul>
      <Link
        href="#"
        className="mt-4 block text-center text-sm font-medium text-primary hover:text-primary-hover rounded-control border border-border py-2"
      >
        View All
      </Link>
    </div>
  );
}
