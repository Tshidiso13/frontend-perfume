"use client";

import { motion } from "framer-motion";

export function QuoteSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fbfaf7]">
      {/* =====================================================
          HUMAN / ORGANIC BACKGROUND
      ====================================================== */}

      {/* Soft warm glow — left */}
      <motion.div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-1/2
          -z-10
          size-[420px]
          -translate-y-1/2
          rounded-full
          bg-[#d9bca8]/20
          blur-[120px]
        "
        animate={{
          x: [0, 35, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Soft burgundy glow — right */}
      <motion.div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          top-10
          -z-10
          size-[460px]
          rounded-full
          bg-[#7b3445]/[0.06]
          blur-[140px]
        "
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Soft central light */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[260px]
          w-[680px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white/50
          blur-[100px]
        "
      />

      {/* Very subtle paper grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(78, 42, 33, 0.035) 0.7px, transparent 0.8px),
            radial-gradient(circle at 80% 60%, rgba(78, 42, 33, 0.025) 0.7px, transparent 0.8px)
          `,
          backgroundSize: "18px 18px, 22px 22px",
        }}
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto flex min-h-[420px] max-w-[1100px] items-center justify-center px-6 py-24 sm:min-h-[470px] sm:px-8 lg:min-h-[520px] lg:py-32">
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
            amount: 0.45,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-[850px] text-center"
        >
          {/* Definition */}
          <motion.p
            initial={{
              opacity: 0,
              y: 10,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
            className="
              mb-7
              text-[9px]
              font-medium
              uppercase
              tracking-[0.32em]
              !text-[#9a5d4f]
              sm:text-[10px]
            "
          >
            Sillage / si-yazh / noun
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{
              width: 0,
            }}
            whileInView={{
              width: 42,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mb-8 h-px bg-[#b99988]"
          />

          {/* Quote */}
          <blockquote>
            <motion.p
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                font-display
                text-[34px]
                font-normal
                leading-[1.08]
                tracking-[-0.035em]
                !text-[#6b2230]
                sm:text-[44px]
                md:text-[52px]
                lg:text-[58px]
              "
            >
              “The beautiful trace of a fragrance
              <span className="block">
                that remains after you&apos;ve left.”
              </span>
            </motion.p>
          </blockquote>

          {/* Supporting copy */}
          <motion.p
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
              delay: 0.38,
            }}
            className="
              mt-7
              text-[11px]
              tracking-[0.01em]
              !text-[#8e7770]
              sm:text-[12px]
            "
          >
            Make yours worth remembering.
          </motion.p>
        </motion.div>
      </div>

      {/* =====================================================
          VERY SUBTLE BOTTOM FADE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-20
          bg-gradient-to-t
          from-[#f6f2ec]/60
          to-transparent
        "
      />
    </section>
  );
}