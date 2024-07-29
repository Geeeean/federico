import Banner from "@/components/Banner";
import Hero from "@/components/Hero";
import ProfessionalsSpoiler from "@/components/ProfessionalsSpoiler";
import ServicesSpoiler from "@/components/ServicesSpoiler";

export default function Home() {
  return (
    <main className="mt-12">
      <Banner/>
      <Hero/>
      <ProfessionalsSpoiler />
      <ServicesSpoiler />
    </main>
  );
}
