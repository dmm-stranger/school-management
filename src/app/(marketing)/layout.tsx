import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function MarketingGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
