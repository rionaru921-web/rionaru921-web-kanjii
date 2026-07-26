"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ_CATEGORIES } from "@/lib/faq";
import FaqCategoryTabs from "@/components/landing/FaqCategoryTabs";
import FaqItem from "@/components/landing/FaqItem";
import SectionTitle from "@/components/landing/SectionTitle";

export default function FaqSection() {
  const [activeCategoryId, setActiveCategoryId] = useState(FAQ_CATEGORIES[0].id);
  const activeCategory = FAQ_CATEGORIES.find((c) => c.id === activeCategoryId) ?? FAQ_CATEGORIES[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };

  return (
    <section id="faq" className="px-4 py-20 md:py-28 bg-surface-secondary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <SectionTitle title="よくあるご質問" className="mb-12" />

        <FaqCategoryTabs
          categories={FAQ_CATEGORIES}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategoryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              {activeCategory.items.map((item) => (
                <FaqItem key={item.id} item={item} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
