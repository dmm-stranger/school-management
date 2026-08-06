import { TopUtilityBar } from "@/components/marketing/TopUtilityBar";
import { MainNav } from "@/components/marketing/MainNav";
import { Hero } from "@/components/marketing/Hero";
import { FeatureHighlights } from "@/components/marketing/FeatureHighlights";
import { StatsBar } from "@/components/marketing/StatsBar";
import { CampusLife } from "@/components/marketing/CampusLife";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <TopUtilityBar />
      <MainNav />
      <main>
        <Hero />
        <FeatureHighlights />
        <StatsBar />
        <CampusLife />
      </main>
      <Footer />
    </>
  );
}
