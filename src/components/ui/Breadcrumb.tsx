import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav className={`flex items-center gap-1.5 text-sm text-muted ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-heading font-medium" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={14} aria-hidden="true" />}
          </span>
        );
      })}
    </nav>
  );
}
