import Header from "@/components/shared/Header";
import Hero from "@/components/landing/Hero";
import ServiceCards from "@/components/landing/ServiceCards";
import Story from "@/components/landing/Story";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { createClient } from "@/lib/supabase/server";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "幹事ラボ",
  description:
    "AIが飲み会・旅行・イベントの幹事を代行。参加者の好み・予算・エリアから最適なお店を提案し、日程調整・割り勘・集金までサポートします。",
  url: "https://kanjii.app",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  inLanguage: "ja-JP",
};

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <ServiceCards />
        <Story />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTASection isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  );
}
