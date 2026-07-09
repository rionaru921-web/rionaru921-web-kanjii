import Header from "@/components/shared/Header";
import Hero from "@/components/landing/Hero";
import ServiceCards from "@/components/landing/ServiceCards";
import Story from "@/components/landing/Story";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <>
      <Header />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <ServiceCards />
        <Story />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  );
}
