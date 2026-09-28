"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function EditorialSplit() {
  return (
    <section className="overflow-hidden bg-[#f1e9df]">
      <div className="grid lg:grid-cols-2">
        {/* =====================================================
            LEFT — EDITORIAL IMAGE
        ====================================================== */}

        <div className="relative min-h-[500px] overflow-hidden bg-[#160807] sm:min-h-[580px] lg:min-h-[610px]">
          <motion.div
            initial={{
              opacity: 0,
              scale: 1.06,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src="/images/home/editorial-perfume.png"
              alt="Élan perfume editorial"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="
                object-cover
                object-[58%_center]
                transition-transform
                duration-[1800ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:scale-[1.02]
              "
            />
          </motion.div>

          {/* Cinematic overlays */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          {/* Text over image */}

          <motion.div
            initial={{
              opacity: 0,
              y: 28,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute bottom-10 left-6 z-10 sm:bottom-12 sm:left-10 lg:left-16"
          >
            <p className="font-display text-[38px] font-normal uppercase leading-[0.9] tracking-[-0.02em] !text-white sm:text-[48px] lg:text-[54px]">
              Your next
            </p>

            <p className="mt-1 font-display text-[38px] font-normal italic leading-[0.9] tracking-[-0.025em] !text-[#f5e4dc] sm:text-[48px] lg:text-[54px]">
              little obsession.
            </p>
          </motion.div>
        </div>

        {/* =====================================================
            RIGHT — CONTENT
        ====================================================== */}

        <div className="flex min-h-[520px] items-center bg-[#f1e9df] px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[610px] lg:px-16 xl:px-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-[650px]"
          >
            {/* Eyebrow */}

            <p className="mb-7 text-[9px] font-semibold uppercase tracking-[0.32em] !text-[#9b6250] sm:text-[10px]">
              Let&apos;s make it personal
            </p>

            {/* Heading */}

            <h2 className="font-display text-[48px] font-normal leading-[0.93] tracking-[-0.035em] !text-[#3a2926] sm:text-[58px] lg:text-[66px]">
              A scent that
              <br />
              feels like{" "}
              <span className="italic !text-[#9b6756]">
                you.
              </span>
            </h2>

            {/* Description */}

            <p className="mt-8 max-w-[620px] text-[13px] leading-7 !text-[#876d64] sm:text-[14px] sm:leading-8">
              Something fresh for your everyday? Something a little mysterious
              for after dark? A few simple questions will point you in the right
              direction.
            </p>

            {/* CTA */}

            <Link
              href="/scent-finder"
              className="
                group
                mt-8
                inline-flex
                min-h-[50px]
                min-w-[210px]
                items-center
                justify-between
                gap-8
                bg-[#551728]
                px-6
                text-[11px]
                font-medium
                !text-white

                transition-colors
                duration-300

                hover:bg-[#671d31]
              "
            >
              <span>Find my fragrance</span>

              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1.5"
                strokeWidth={1.4}
              />
            </Link>

            {/* Supporting copy */}

            <p className="mt-4 text-[10px] leading-5 !text-[#9c8178] sm:text-[11px]">
              A few questions. A little discovery. All you.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}