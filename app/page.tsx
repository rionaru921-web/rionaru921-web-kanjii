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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServiceCards />
        <Story />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
