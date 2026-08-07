import { TopUtilityBar } from "./TopUtilityBar";
import { MainNav } from "./MainNav";
import { Footer } from "./Footer";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopUtilityBar />
      <MainNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
