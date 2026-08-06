import Link from "next/link";
import { PartyPopper, Clock, MapPin } from "lucide-react";
import { UPCOMING_EVENTS } from "@/config/demo-data";

export function UpcomingEvents() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm h-full flex flex-col">
      <h3 className="font-display font-semibold text-heading mb-4">
        Upcoming Events
      </h3>
      <ul className="flex-1 space-y-3">
        {UPCOMING_EVENTS.map((event) => (
          <li key={event.title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <PartyPopper size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-heading">{event.title}</p>
              <p className="text-xs text-muted flex items-center gap-1 mt-1">
                <Clock size={12} aria-hidden="true" /> {event.when}
              </p>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <MapPin size={12} aria-hidden="true" /> {event.where}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="#"
        className="mt-4 block text-center text-sm font-medium text-primary hover:text-primary-hover rounded-control border border-border py-2"
      >
        View Calendar
      </Link>
    </div>
  );
}
