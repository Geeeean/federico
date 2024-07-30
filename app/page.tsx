import Banner from "@/components/Banner";
import Hero from "@/components/Hero";
import ProfessionalsSpoiler from "@/components/ProfessionalsSpoiler";
import ServicesSpoiler from "@/components/ServicesSpoiler";
import IdentitySpoiler from "@/components/IdentitySpoiler";

export default function Home() {
  return (
    <main className="mt-12 flex flex-col gap-56">
      <div className="flex flex-col gap-20">
        <Banner />
        <Hero />
      </div>
      <ProfessionalsSpoiler />
      <ServicesSpoiler />
      <IdentitySpoiler />
    </main>
  );
}
