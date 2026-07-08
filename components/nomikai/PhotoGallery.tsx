"use client";

import { useState } from "react";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";

export default function PhotoGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-56 sm:h-72 w-full rounded-2xl bg-gradient-to-br from-gold/15 to-vermilion/10 flex items-center justify-center">
        <UtensilsCrossed className="text-gold/40" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-56 sm:h-80 w-full rounded-2xl overflow-hidden bg-surface-tertiary">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                idx === activeIndex ? "border-gold" : "border-transparent opacity-60"
              }`}
            >
              <Image src={src} alt={`${alt} ${idx + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
