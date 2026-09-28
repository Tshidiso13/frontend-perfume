"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import {
  SCENT_MOOD_OPTIONS,
  type ScentMood,
} from "@/lib/scent-finder-options";

const MOOD_STYLES: Record<
  ScentMood,
  {
    number: string;
    description: string;
    background: string;
    foreground: string;
    accent: string;
    glow: string;
  }
> = {
  fresh: {
    number: "01",
    description: "A breath of fresh air.",
    background: "#dfe5dd",
    foreground: "#465348",
    accent: "#748078",
    glow: "rgba(255,255,255,0.28)",
  },
  warm: {
    number: "02",
    description: "For evenings that linger.",
    background: "#ead6c1",
    foreground: "#8a472d",
    accent: "#9b6245",
    glow: "rgba(255,255,255,0.25)",
  },
  dark: {
    number: "03",
    description: "Leave a little to the imagination.",
    background: "#554542",
    foreground: "#f7e9d7",
    accent: "#f1dbc4",
    glow: "rgba(255,255,255,0.08)",
  },
  soft: {
    number: "04",
    description: "Let your softer side speak.",
    background: "#ead8da",
    foreground: "#8c3d4a",
    accent: "#96515c",
    glow: "rgba(255,255,255,0.25)",
  },
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const card = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function MoodSection() {
  return (
    <section className="bg-[#fbfaf7] px-5 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 grid gap-8 lg:mb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a5d4f] sm:text-[10px]">
              Follow a feeling
            </p>

            <h2 className="font-display text-[40px] font-normal leading-[0.95] tracking-[-0.03em] !text-[#351a1d] sm:text-5xl lg:text-[58px]">
              What are you in the mood for?
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-[270px] text-[12px] leading-6 !text-[#8f7770] lg:pb-1"
          >
            You don&apos;t need to know the notes.
            <br />
            Just know how you want to feel.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SCENT_MOOD_OPTIONS.map((mood) => {
            const style = MOOD_STYLES[mood.value];

            return (
              <motion.div
                key={mood.value}
                variants={card}
                whileHover={{
                  y: -5,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/mood?mood=${encodeURIComponent(mood.value)}`}
                  className="
                    group
                    relative
                    flex
                    min-h-[235px]
                    overflow-hidden
                    p-6
                    sm:min-h-[250px]
                    lg:min-h-[270px]
                  "
                  style={{
                    backgroundColor: style.background,
                    color: style.foreground,
                  }}
                >
                  <span
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      -right-20
                      size-48
                      scale-75
                      rounded-full
                      opacity-0
                      blur-2xl
                      transition-all
                      duration-700
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      group-hover:scale-125
                      group-hover:opacity-100
                    "
                    style={{
                      backgroundColor: style.glow,
                    }}
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      border
                      border-black/0
                      transition-colors
                      duration-500
                      group-hover:border-black/[0.05]
                    "
                  />

                  <div className="relative z-10 flex w-full flex-col justify-between">
                    <span
                      className="text-[10px] font-medium tracking-[0.12em]"
                      style={{
                        color: style.accent,
                      }}
                    >
                      {style.number}
                    </span>

                    <div>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3
                            className="
                              font-display
                              text-[28px]
                              font-normal
                              leading-none
                              tracking-[-0.025em]
                              transition-transform
                              duration-500
                              ease-[cubic-bezier(0.22,1,0.36,1)]
                              group-hover:-translate-y-1
                              sm:text-[30px]
                            "
                            style={{
                              color: style.foreground,
                            }}
                          >
                            {mood.label}
                          </h3>

                          <p
                            className="
                              mt-3
                              max-w-[190px]
                              text-[11px]
                              leading-5
                              transition-transform
                              duration-500
                              ease-[cubic-bezier(0.22,1,0.36,1)]
                              group-hover:-translate-y-1
                            "
                            style={{
                              color: style.accent,
                            }}
                          >
                            {style.description}
                          </p>
                        </div>

                        <span
                          className="
                            mb-1
                            flex
                            size-8
                            shrink-0
                            items-center
                            justify-center
                            transition-transform
                            duration-500
                            ease-[cubic-bezier(0.22,1,0.36,1)]
                            group-hover:-translate-y-1
                            group-hover:translate-x-1
                          "
                          style={{
                            color: style.accent,
                          }}
                        >
                          <ArrowUpRight
                            className="size-[18px]"
                            strokeWidth={1.5}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
