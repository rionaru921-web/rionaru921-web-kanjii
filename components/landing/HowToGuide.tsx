"use client";

import { HOW_TO_STEPS } from "@/lib/how-to-steps";
import HowToStep from "@/components/landing/HowToStep";
import SectionTitle from "@/components/landing/SectionTitle";

export default function HowToGuide() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="実際の画面で、もう少し詳しく。"
          subtitle="迷わず幹事を、この一画面で。"
          className="mb-16"
        />

        <div className="space-y-16 md:space-y-24">
          {HOW_TO_STEPS.map((step) => (
            <HowToStep key={step.step} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
