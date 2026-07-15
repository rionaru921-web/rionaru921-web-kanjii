"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Wine, Plane, PartyPopper, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

const SERVICES = [
  {
    icon: Wine,
    title: "飲み会幹事",
    description: "AIがベストなお店を選定。割り勘まで自動化。",
    status: "available" as const,
    href: "/nomikai",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80",
  },
  {
    icon: Plane,
    title: "旅行幹事",
    description: "目的地・日程から最適プランを提案。費用分担も。",
    status: "available" as const,
    href: "/travel",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
  },
  {
    icon: PartyPopper,
    title: "イベント幹事",
    description: "BBQ・合宿・パーティー会場を一括検索。",
    status: "soon" as const,
    href: "/event",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",
  },
  {
    icon: Briefcase,
    title: "会社の幹事",
    description: "忘年会・歓送迎会・経費精算まで完全対応。",
    status: "soon" as const,
    href: "/company",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
  },
];

export default function ServiceCards() {
  return (
    <section id="services" className="px-4 py-24 sm:py-32 bg-surface-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-4">
            幹事の全てを、幹事ラボが担います
          </h2>
          <MizuhikiDivider />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={service.href}
                  className="group block h-full rounded-3xl bg-surface-tertiary overflow-hidden shadow-warm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-hover"
                >
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "sepia(0.05) saturate(1.1)" }}
                    />
                    <span className="absolute top-4 left-4 flex items-center justify-center w-11 h-11 rounded-xl bg-surface-tertiary/90 backdrop-blur-sm text-gold shadow-warm">
                      <Icon size={20} />
                    </span>
                    {service.status === "soon" ? (
                      <span className="absolute top-4 right-4 text-[11px] rounded-full bg-ink-primary/70 text-white px-2.5 py-1 backdrop-blur-sm">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 text-[11px] rounded-full bg-sage/90 text-white px-2.5 py-1 backdrop-blur-sm">
                        利用可能
                      </span>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    <h3 className="font-serif font-bold text-lg text-ink mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-ink-secondary leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <span className="inline-flex items-center gap-1 text-sm text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      詳しく見る
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
