import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { AboutSidebar } from "./AboutSidebar";

export function AboutPageShell({
  breadcrumbItems,
  promo,
  children,
}: {
  breadcrumbItems: BreadcrumbItem[];
  promo?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 lg:grid-cols-[280px_1fr]">
      <AboutSidebar promo={promo} />
      <div>
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        {children}
      </div>
    </div>
  );
}
