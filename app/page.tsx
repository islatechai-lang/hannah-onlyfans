import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LandingSections from "@/components/LandingSections";

export default function HomePage() {
  return (
    <main className="noise">
      <Navbar />
      <HeroSection />
      <LandingSections />
    </main>
  );
}
