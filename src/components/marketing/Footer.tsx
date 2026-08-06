import Link from "next/link";
import { ShieldCheck, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-heading text-white/70">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck size={22} aria-hidden="true" />
            <span className="font-display font-semibold">EduVision School</span>
          </div>
          <p className="text-sm mt-3">Nurturing Minds, Inspiring Futures.</p>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
            <li><Link href="/admissions" className="hover:text-white">Admissions</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Portals</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-white">Parents Portal</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Student Portal</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Staff Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" /> 123 Education Street, Springfield, USA
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} aria-hidden="true" /> +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} aria-hidden="true" /> info@eduvision.edu
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EduVision School. All rights reserved.
      </div>
    </footer>
  );
}
