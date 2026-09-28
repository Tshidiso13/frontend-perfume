"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Leaf,
  Package,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Leaf,
    label: "Thoughtfully curated",
  },
  {
    icon: Sparkles,
    label: "Scents with a story",
  },
  {
    icon: Package,
    label: "Made for gifting",
  },
  {
    icon: Heart,
    label: "A little everyday luxury",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbfaf7]">
      {/* =====================================================
          MAIN HERO
      ====================================================== */}
      <div className="grid lg:grid-cols-2">
        {/* =====================================================
            LEFT — COPY
        ====================================================== */}
        <div className="relative flex min-h-[620px] overflow-hidden bg-[#35101c] px-6 py-14 sm:px-10 sm:py-16 lg:min-h-[700px] lg:px-14 lg:py-16 xl:px-20 2xl:px-24">
          {/* Decorative background glow */}
          <div className="pointer-events-none absolute -left-32 top-16 size-[420px] rounded-full bg-[#773246]/20 blur-[120px]" />

          <div className="pointer-events-none absolute -bottom-40 right-0 size-[380px] rounded-full bg-[#541b2c]/30 blur-[120px]" />

          {/* Content */}
          <div className="relative z-10 mx-auto flex w-full max-w-[680px] flex-col">
            {/* Top content */}
            <div className="flex flex-1 flex-col justify-center">
              {/* Eyebrow */}
              <motion.p
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-7 text-[9px] font-semibold uppercase tracking-[0.3em] !text-[#d8b9bd] sm:text-[10px]"
              >
                A fragrance. A feeling. A part of you.
              </motion.p>

              {/* Main heading */}
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  max-w-[620px]
                  font-display
                  text-[clamp(3.65rem,5.25vw,6.25rem)]
                  font-normal
                  leading-[0.9]
                  tracking-[-0.045em]
                  !text-[#f8eee7]
                "
              >
                <span className="block !text-[#f8eee7]">
                  Some things
                </span>

                <span className="block !text-[#f8eee7]">
                  stay with you.
                </span>

                <span className="mt-3 block font-normal italic !text-[#dcb8bb]">
                  Your scent should.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-7 max-w-[430px] text-[13px] leading-7 !text-white/70 sm:text-[14px] sm:leading-8"
              >
                For quiet mornings, unforgettable evenings,
                <br className="hidden sm:block" />
                and every version of you in between.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5"
              >
                {/* Primary */}
                <Link
                  href="/shop"
                  className="
                    group
                    inline-flex
                    min-h-[50px]
                    items-center
                    justify-between
                    gap-10
                    bg-[#f7ede5]
                    px-6
                    text-[11px]
                    font-medium
                    text-[#4b1923]
                    transition-all
                    duration-300
                    hover:bg-white
                    sm:min-w-[210px]
                  "
                >
                  <span>Explore fragrances</span>

                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.4}
                  />
                </Link>

                {/* Secondary */}
                <Link
                  href="/scent-finder"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-4
                    border-b
                    border-white/50
                    pb-2
                    text-[11px]
                    font-medium
                    !text-white/90
                    transition-colors
                    hover:!text-white
                  "
                >
                  <span>Find my scent</span>

                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.4}
                  />
                </Link>
              </motion.div>
            </div>

            {/* Bottom metadata */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.7,
              }}
              className="mt-12 flex items-end justify-between gap-6 pt-4"
            >
              <p className="text-[8px] font-medium uppercase tracking-[0.19em] !text-white/40 sm:text-[9px]">
                Curated with care. Worn with feeling.
              </p>

              <p className="shrink-0 text-[8px] tracking-[0.16em] !text-white/40 sm:text-[9px]">
                01 — 03
              </p>
            </motion.div>
          </div>
        </div>

        {/* =====================================================
            RIGHT — IMAGE
        ====================================================== */}
        <div className="relative min-h-[500px] overflow-hidden bg-[#160807] sm:min-h-[580px] lg:min-h-[700px]">
          {/* Image animation */}
          <motion.div
            initial={{
              scale: 1.07,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src="/images/home/hero-perfume.png"
              alt="Élan Ambre Nocturne perfume"
              fill
              priority
              quality={95}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="
                object-cover
                object-[68%_center]
                transition-transform
                duration-[1600ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:scale-[1.015]
              "
            />
          </motion.div>

          {/* Cinematic overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/5" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          {/* Collection label */}
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.65,
            }}
            className="absolute bottom-7 left-6 z-10 sm:bottom-9 sm:left-9"
          >
            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] !text-white sm:text-[9px]">
              The signature collection
            </p>
          </motion.div>

          {/* Product name */}
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.75,
            }}
            className="absolute bottom-7 right-6 z-10 sm:bottom-9 sm:right-9"
          >
            <Link
              href="/families/amber"
              className="group flex items-center gap-4"
            >
              <span className="font-display text-xl !text-white sm:text-2xl lg:text-[28px]">
                Ambre Nocturne
              </span>

              <ArrowUpRight
                className="size-4 !text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                strokeWidth={1.4}
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          BENEFIT BAR
      ====================================================== */}
      <div className="border-b border-[#e5ddd3] bg-[#fbfaf7]">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`
                  flex min-h-[68px]
                  items-center
                  justify-center
                  gap-3
                  border-[#e5ddd3]
                  px-4

                  ${index < 2 ? "border-b lg:border-b-0" : ""}
                  ${index % 2 === 0 ? "border-r lg:border-r-0" : ""}
                `}
              >
                <Icon
                  className="size-[14px] text-[#9b6a4b]"
                  strokeWidth={1.4}
                />

                <span className="text-[9px] text-[#795f55] sm:text-[10px] xl:text-[11px]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}