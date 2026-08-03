import Header from "@/components/shared/Header";
import Hero from "@/components/landing/Hero";
import NoLoginBanner from "@/components/landing/NoLoginBanner";
import ServiceCards from "@/components/landing/ServiceCards";
import UseCases from "@/components/landing/UseCases";
import SurveyShowcase from "@/components/landing/SurveyShowcase";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import Story from "@/components/landing/Story";
import HowItWorks from "@/components/landing/HowItWorks";
import HowToGuide from "@/components/landing/HowToGuide";
import Pricing from "@/components/landing/Pricing";
import FaqSection from "@/components/landing/FaqSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { createClient } from "@/lib/supabase/server";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "幹事ラボ",
  description:
    "幹事ラボは、飲み会・旅行・イベントの幹事業務をサポート。日程調整・お店選び・割り勘・集金まで、あなたの「幹事する」をシンプルにします。",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kanji-lab.com",
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
        <NoLoginBanner />
        <UseCases />
        <SurveyShowcase />
        <FeatureShowcase />
        <HowToGuide />
        <HowItWorks />
        <ServiceCards />
        <Pricing />
        <FaqSection />
        <Story />
        <CTASection isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  );
}
