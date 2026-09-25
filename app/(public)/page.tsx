import { CTA } from "@/components/public/CTA";
import { Hero } from "@/components/public/Hero";
import { Marquee } from "@/components/public/Marquee";
import { Services } from "@/components/public/Services";
import { Stats } from "@/components/public/Stats";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee/>
      <Services/>
      <Stats/>
      <WhyChooseUs/>
      <CTA/>
      {/* We will add more sections (Services, Stats, etc.) below later */}
    </>
  );
}