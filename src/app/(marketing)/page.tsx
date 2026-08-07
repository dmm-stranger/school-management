import { Hero } from "@/components/marketing/Hero";
import { FeatureHighlights } from "@/components/marketing/FeatureHighlights";
import { StatsBar } from "@/components/marketing/StatsBar";
import { CampusLife } from "@/components/marketing/CampusLife";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <StatsBar />
      <CampusLife />
    </>
  );
}
