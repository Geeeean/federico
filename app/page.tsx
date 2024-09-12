import Banner from "@/components/Banner";
import Hero from "@/components/Hero";
import ProfessionalsSpoiler from "@/components/ProfessionalsSpoiler";
import ServicesSpoiler from "@/components/ServicesSpoiler";
import IdentitySpoiler from "@/components/IdentitySpoiler";

export default function Home() {
  return (
    <main className="flex flex-col gap-20 md:gap-56 relative items-center">
      <div className="flex flex-col gap-20 md:border-none items-center">
        <Hero />
      </div>
      <ProfessionalsSpoiler />
      <ServicesSpoiler />
      {/* <IdentitySpoiler /> */}
    </main>
  );
}
