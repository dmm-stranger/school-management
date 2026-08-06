import { MapPin, Phone, Mail, Link2, MessageCircle, Camera, Video } from "lucide-react";

const PORTAL_LINKS = [
  { label: "Parents Portal", href: "/dashboard" },
  { label: "Student Portal", href: "/dashboard" },
  { label: "Staff Portal", href: "/dashboard" },
];

export function TopUtilityBar() {
  return (
    <div className="hidden md:block bg-heading text-white/90 text-xs">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} aria-hidden="true" />
            123 Education Street, Springfield, USA
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} aria-hidden="true" />
            +1 (555) 123-4567
          </span>
          <span className="flex items-center gap-1.5">
            <Mail size={13} aria-hidden="true" />
            info@eduvision.edu
          </span>
        </div>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-4">
            {PORTAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <a href="#" aria-label="Facebook"><Link2 size={14} /></a>
            <a href="#" aria-label="Twitter"><MessageCircle size={14} /></a>
            <a href="#" aria-label="Instagram"><Camera size={14} /></a>
            <a href="#" aria-label="YouTube"><Video size={14} /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
