import Hero from "@/components/Hero";
import ProfessionalsSpoiler from "@/components/ProfessionalsSpoiler";
import ServicesSpoiler from "@/components/ServicesSpoiler";
import IdentitySpoiler from "@/components/IdentitySpoiler";
import ContactForm from "@/components/ContactForm";
import Location from "@/components/Location";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 md:gap-20 relative items-center">
      <Hero />
      <ServicesSpoiler />
      <ProfessionalsSpoiler />
      <ContactForm />
      <IdentitySpoiler />
      <Location />
    </main>
  );
}
