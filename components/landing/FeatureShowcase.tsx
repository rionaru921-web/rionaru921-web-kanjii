"use client";

import { FEATURES } from "@/lib/features";
import FeatureRow from "@/components/landing/FeatureRow";
import SectionTitle from "@/components/landing/SectionTitle";

export default function FeatureShowcase() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="機能で選ぶ、幹事ラボ"
          subtitle="一つひとつが、幹事の負担を減らすために。"
          className="mb-16 md:mb-24"
        />

        <div className="space-y-20 md:space-y-32">
          {FEATURES.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} reverse={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
