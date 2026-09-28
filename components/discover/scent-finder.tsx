"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  LoaderCircle,
  Package,
  ShoppingBag,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { toast } from "sonner";

import type {
  Product,
} from "@/services/products.service";

import {
  cartService,
} from "@/services/cart.service";

import {
  CART_DRAWER_OPEN_EVENT,
  CART_UPDATED_EVENT,
  CartDrawer,
} from "@/components/cart/cart-drawer";

import {
  scentFinderService,
  type ScentBudget,
  type ScentFinderPayload,
  type ScentMood,
  type ScentOccasion,
  type ScentPersonality,
  type ScentRecommendation,
} from "@/services/scent-finder.service";

/* =========================================================
   TYPES
========================================================= */

type Answers = {
  occasion?: ScentOccasion;
  mood?: ScentMood;
  personality?: ScentPersonality;
  budget?: ScentBudget;
};

type QuestionOption = {
  value: string;
  label: string;
};

type Question = {
  key: keyof Answers;
  eyebrow: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
};



type StoredWishlistItem = {
  productId: string;
  slug: string;
  name: string;
  family: string;
  concentration: string;
  imageUrl: string | null;
  startingPrice: number | null;
  createdAt: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const QUESTIONS: Question[] = [
  {
    key: "occasion",
    eyebrow: "Question 1 of 4",
    title:
      "Where will your scent take you?",
    subtitle:
      "No right answers. Just your kind of feeling.",
    options: [
      {
        value: "everyday",
        label: "Everyday",
      },
      {
        value: "office",
        label: "The office",
      },
      {
        value: "date-night",
        label: "Date night",
      },
      {
        value: "special",
        label:
          "Somewhere special",
      },
    ],
  },
  {
    key: "mood",
    eyebrow: "Question 2 of 4",
    title:
      "What are you drawn to?",
    subtitle:
      "No right answers. Just your kind of feeling.",
    options: [
      {
        value: "fresh",
        label:
          "Fresh & clean",
      },
      {
        value: "warm",
        label:
          "Warm & seductive",
      },
      {
        value: "dark",
        label:
          "Dark & mysterious",
      },
      {
        value: "soft",
        label:
          "Soft & romantic",
      },
    ],
  },
  {
    key: "personality",
    eyebrow: "Question 3 of 4",
    title:
      "How do you want to be remembered?",
    subtitle:
      "No right answers. Just your kind of feeling.",
    options: [
      {
        value: "confident",
        label:
          "Quietly confident",
      },
      {
        value: "inviting",
        label:
          "Warm and inviting",
      },
      {
        value: "mysterious",
        label:
          "A little mysterious",
      },
      {
        value: "romantic",
        label:
          "Soft and romantic",
      },
    ],
  },
  {
    key: "budget",
    eyebrow: "Question 4 of 4",
    title:
      "What feels right for your budget?",
    subtitle:
      "No right answers. Just your kind of feeling.",
    options: [
      {
        value:
          "under-1300",
        label:
          "Under R1,300",
      },
      {
        value:
          "1300-1700",
        label:
          "R1,300–R1,700",
      },
      {
        value:
          "1700-plus",
        label:
          "R1,700 and above",
      },
      {
        value: "any",
        label:
          "Let me explore",
      },
    ],
  },
];

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  );

/* =========================================================
   SCENT FINDER
========================================================= */

export function ScentFinder() {
  const [
    step,
    setStep,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState<Answers>({});

  const [
    recommendations,
    setRecommendations,
  ] = useState<
    ScentRecommendation[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const finished =
    step >=
    QUESTIONS.length;

  const currentQuestion =
    QUESTIONS[step];

  async function loadRecommendations(
    payload: Answers
  ) {
    setLoading(true);
    setError(null);

    try {
      const response =
        await scentFinderService.recommend(
          {
            ...payload,
            limit: 3,
          }
        );

      setRecommendations(
        response.data ??
          []
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to find fragrance recommendations.";

      setError(
        message
      );

      toast.error(
        message
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  function selectOption(
    key: keyof Answers,
    value: string
  ) {
    const nextAnswers: Answers =
      {
        ...answers,
        [key]:
          value,
      };

    setAnswers(
      nextAnswers
    );

    window.setTimeout(
      () => {
        const nextStep =
          step + 1;

        setStep(
          nextStep
        );

        if (
          nextStep >=
          QUESTIONS.length
        ) {
          void loadRecommendations(
            nextAnswers
          );
        }
      },
      180
    );
  }

  function previousQuestion() {
    setStep(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    );
  }

  function restart() {
    setAnswers({});
    setRecommendations([]);
    setError(null);
    setStep(0);
  }

  function retryRecommendations() {
    void loadRecommendations(
      answers
    );
  }

  return (
    <>
      <section className="min-h-[720px] bg-[#fbfaf7]">
      <AnimatePresence mode="wait">
        {!finished &&
        currentQuestion ? (
          <QuestionScreen
            key={
              step
            }
            step={
              step
            }
            question={
              currentQuestion
            }
            selected={
              answers[
                currentQuestion
                  .key
              ]
            }
            onSelect={(
              value
            ) =>
              selectOption(
                currentQuestion.key,
                value
              )
            }
            onPrevious={
              previousQuestion
            }
          />
        ) : (
          <ResultsScreen
            key="results"
            recommendations={
              recommendations
            }
            loading={
              loading
            }
            error={
              error
            }
            onRetry={
              retryRecommendations
            }
            onRestart={
              restart
            }
          />
        )}
        </AnimatePresence>
      </section>

      <CartDrawer />
    </>
  );
}

/* =========================================================
   QUESTION SCREEN
========================================================= */

type QuestionScreenProps = {
  step: number;
  question: Question;
  selected?: string;
  onSelect: (
    value: string
  ) => void;
  onPrevious: () => void;
};

function QuestionScreen({
  step,
  question,
  selected,
  onSelect,
  onPrevious,
}: QuestionScreenProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 35,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -30,
      }}
      transition={{
        duration: 0.45,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="
        mx-auto
        flex
        min-h-[720px]
        max-w-[1120px]
        flex-col
        justify-center
        px-5
        py-16
        sm:px-8
        lg:px-10
      "
    >
      <div className="max-w-[760px]">
        <p className="mb-7 text-[9px] font-semibold uppercase tracking-[0.32em] !text-[#5e3437]">
          The scent finder
        </p>

        <div className="mb-8 flex gap-1.5">
          {QUESTIONS.map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className={`h-[2px] w-8 ${
                  index <= step
                    ? "bg-[#641b2d]"
                    : "bg-[#ddd5ce]"
                }`}
              />
            )
          )}
        </div>

        <p className="mb-6 text-[9px] uppercase tracking-[0.08em] !text-[#9b8279]">
          {
            question.eyebrow
          }
        </p>

        <h1
          className="
            max-w-[760px]
            font-display
            text-[45px]
            font-normal
            leading-[0.94]
            tracking-[-0.035em]
            !text-[#392725]
            sm:text-[58px]
            lg:text-[68px]
          "
        >
          {
            question.title
          }
        </h1>

        <p className="mt-5 text-[12px] !text-[#8d746d]">
          {
            question.subtitle
          }
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {question.options.map(
            (
              option,
              index
            ) => {
              const active =
                selected ===
                option.value;

              return (
                <motion.button
                  key={
                    option.value
                  }
                  type="button"
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale:
                      0.99,
                  }}
                  onClick={() =>
                    onSelect(
                      option.value
                    )
                  }
                  className={`
                    group
                    flex
                    min-h-[78px]
                    items-center
                    justify-between
                    border
                    px-5
                    text-left
                    transition-all
                    duration-300

                    ${
                      active
                        ? "border-[#6b2230] bg-[#6b2230] !text-white"
                        : "border-[#ddd5ce] bg-[#f3eee8] !text-[#3c2926] hover:border-[#b39a90] hover:bg-[#eee7df]"
                    }
                  `}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={
                        active
                          ? "text-[9px] !text-white/55"
                          : "text-[9px] !text-[#9c7e74]"
                      }
                    >
                      0
                      {index +
                        1}
                    </span>

                    <span className="text-[12px] font-medium">
                      {
                        option.label
                      }
                    </span>
                  </div>

                  <ArrowUpRight
                    className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={
                      1.4
                    }
                  />
                </motion.button>
              );
            }
          )}
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={
              onPrevious
            }
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-3
              border-b
              border-[#6b2230]
              pb-2
              text-[10px]
              font-medium
              !text-[#6b2230]
            "
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-1"
              strokeWidth={
                1.4
              }
            />

            Previous question
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   RESULTS SCREEN
========================================================= */

type ResultsScreenProps = {
  recommendations:
    ScentRecommendation[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRestart: () => void;
};

function ResultsScreen({
  recommendations,
  loading,
  error,
  onRetry,
  onRestart,
}: ResultsScreenProps) {
  const [
    wishlistedIds,
    setWishlistedIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  const [
    addingProductIds,
    setAddingProductIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  useEffect(() => {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    setWishlistedIds(
      new Set(
        wishlist.map(
          (item) =>
            item.productId
        )
      )
    );
  }, []);

  async function addToBag(
    product: Product
  ) {
    if (
      addingProductIds.has(
        product.id
      )
    ) {
      return;
    }

    const variant =
      getPrimaryPurchasableVariant(
        product
      );

    if (!variant) {
      toast.error(
        "This fragrance is currently out of stock."
      );

      return;
    }

    const price =
      Number(
        variant.price
      );

    if (
      !Number.isFinite(
        price
      )
    ) {
      toast.error(
        "This fragrance does not have a valid price."
      );

      return;
    }

    setAddingProductIds(
      (current) => {
        const next =
          new Set(
            current
          );

        next.add(
          product.id
        );

        return next;
      }
    );

    try {
      const response =
        await cartService.add(
          variant.id,
          1
        );

      /*
       * Keep the Navbar cart badge aligned with the
       * authoritative backend cart.
       */
      window.dispatchEvent(
        new CustomEvent(
          CART_UPDATED_EVENT,
          {
            detail: {
              count:
                response.summary
                  .itemCount,
            },
          }
        )
      );

      /*
       * Open the shared responsive cart drawer.
       */
      window.dispatchEvent(
        new CustomEvent(
          CART_DRAWER_OPEN_EVENT
        )
      );

      toast.success(
        `${product.name} added to your bag`,
        {
          description:
            `${variant.size} · ${currency.format(
              price
            )}`,
        }
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to add this fragrance to your bag."
      );
    } finally {
      setAddingProductIds(
        (current) => {
          const next =
            new Set(
              current
            );

          next.delete(
            product.id
          );

          return next;
        }
      );
    }
  }

  function toggleWishlist(
    product: Product
  ) {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    const exists =
      wishlist.some(
        (item) =>
          item.productId ===
          product.id
      );

    const nextWishlist =
      exists
        ? wishlist.filter(
            (item) =>
              item.productId !==
              product.id
          )
        : [
            ...wishlist,
            {
              productId:
                product.id,
              slug:
                product.slug,
              name:
                product.name,
              family:
                product.family,
              concentration:
                product.concentration,
              imageUrl:
                getPrimaryImage(
                  product
                ),
              startingPrice:
                getNullableProductPrice(
                  product
                ),
              createdAt:
                new Date().toISOString(),
            },
          ];

    writeStorageList(
      WISHLIST_STORAGE_KEY,
      nextWishlist
    );

    setWishlistedIds(
      new Set(
        nextWishlist.map(
          (item) =>
            item.productId
        )
      )
    );

    dispatchCommerceEvent(
      WISHLIST_UPDATED_EVENT,
      nextWishlist.length
    );

    toast.success(
      exists
        ? `${product.name} removed from your wishlist`
        : `${product.name} saved to your wishlist`
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="
        mx-auto
        max-w-[1120px]
        px-5
        py-20
        sm:px-8
        lg:px-10
        lg:py-28
      "
    >
      <div className="mb-10 max-w-[800px]">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.32em] !text-[#5e3437]">
          The scent finder
        </p>

        <p className="mb-7 text-[8px] font-semibold uppercase tracking-[0.28em] !text-[#9a7068]">
          A little something,
          just for you
        </p>

        <h1
          className="
            font-display
            text-[48px]
            font-normal
            leading-[0.95]
            tracking-[-0.04em]
            !text-[#3a2926]
            sm:text-[62px]
            lg:text-[72px]
          "
        >
          Your next signature
          might be
          <span className="block">
            here.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-[12px] leading-6 !text-[#8a7770]">
          Your answers are sent
          to the Élan scent finder,
          which matches them
          against the live product
          catalogue.
        </p>
      </div>

      {loading && (
        <div className="flex min-h-[360px] flex-col items-center justify-center">
          <LoaderCircle
            className="size-5 animate-spin !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />

          <p className="mt-4 text-[9px] !text-[#8a7770]">
            Finding your scents...
          </p>
        </div>
      )}

      {!loading &&
        error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl !text-[#392725]">
              We couldn&apos;t find
              your fragrances.
            </p>

            <p className="mt-3 max-w-md text-[11px] !text-[#8a7770]">
              {error}
            </p>

            <button
              type="button"
              onClick={
                onRetry
              }
              className="mt-6 bg-[#6b2230] px-6 py-3 text-[10px] font-medium !text-white"
            >
              Try again
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        recommendations.length >
          0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map(
              (
                recommendation,
                index
              ) => (
                <RecommendationCard
                  key={
                    recommendation
                      .product.id
                  }
                  recommendation={
                    recommendation
                  }
                  index={
                    index
                  }
                  wishlisted={
                    wishlistedIds.has(
                      recommendation
                        .product.id
                    )
                  }
                  adding={
                    addingProductIds.has(
                      recommendation
                        .product.id
                    )
                  }
                  onWishlist={() =>
                    toggleWishlist(
                      recommendation.product
                    )
                  }
                  onAddToBag={() =>
                    void addToBag(
                      recommendation.product
                    )
                  }
                />
              )
            )}
          </div>
        )}

      {!loading &&
        !error &&
        recommendations.length ===
          0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl !text-[#392725]">
              We couldn&apos;t find a
              matching fragrance.
            </p>

            <p className="mt-3 max-w-md text-[11px] leading-5 !text-[#8a7770]">
              Try the scent finder
              again or browse the
              full collection.
            </p>

            <Link
              href="/shop"
              className="mt-6 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
            >
              Browse the collection
            </Link>
          </div>
        )}

      <button
        type="button"
        onClick={
          onRestart
        }
        className="
          group
          mt-12
          inline-flex
          items-center
          gap-5
          border-b
          border-[#6b2230]
          pb-2
          text-[10px]
          font-medium
          !text-[#6b2230]
        "
      >
        Explore a different mood

        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-1"
          strokeWidth={
            1.4
          }
        />
      </button>
    </motion.div>
  );
}

/* =========================================================
   RECOMMENDATION CARD
========================================================= */

function RecommendationCard({
  recommendation,
  index,
  wishlisted,
  adding,
  onWishlist,
  onAddToBag,
}: {
  recommendation:
    ScentRecommendation;
  index: number;
  wishlisted: boolean;
  adding: boolean;
  onWishlist: () => void;
  onAddToBag: () => void;
}) {
  const product =
    recommendation.product;

  const imageUrl =
    getPrimaryImage(
      product
    );

  const variant =
    getPrimaryVariant(
      product
    );

  const availableStock =
    variant
      ? getVariantAvailableStock(
          variant
        )
      : 0;

  const price =
    getNullableProductPrice(
      product
    );

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay:
          index *
          0.1,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="group/product"
    >
      <div className="relative overflow-hidden bg-[#e7e2dc]">
        <Link
          href={`/perfumes/${product.slug}`}
        >
          <div className="relative aspect-[4/5]">
            {imageUrl ? (
              <Image
                src={
                  imageUrl
                }
                alt={
                  product.name
                }
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                unoptimized
                className="object-cover transition-transform duration-[900ms] group-hover/product:scale-[1.025]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#eee9e3]">
                <Package
                  className="size-8 !text-[#aa9991]"
                  strokeWidth={
                    1.2
                  }
                />
              </div>
            )}
          </div>
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7] px-3 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#544945]">
            {
              product.badge
            }
          </span>
        )}

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={
            wishlisted
          }
          onClick={
            onWishlist
          }
          className={`
            absolute
            right-3
            top-3
            z-20
            flex
            size-9
            items-center
            justify-center
            rounded-full
            backdrop-blur
            transition-all

            ${
              wishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/80 !text-[#694d46] hover:scale-110 hover:bg-white"
            }
          `}
        >
          <Heart
            className={`size-[17px] ${
              wishlisted
                ? "fill-current"
                : ""
            }`}
            strokeWidth={
              1.35
            }
          />
        </button>

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            translate-y-0
            transition-transform
            duration-500
            md:translate-y-full
            md:group-hover/product:translate-y-0
          "
        >
          <button
            type="button"
            disabled={
              !variant ||
              availableStock <= 0 ||
              adding
            }
            onClick={
              onAddToBag
            }
            className="
              group/bag
              flex
              h-[50px]
              w-full
              items-center
              justify-between
              bg-[#fbfaf7]/95
              px-5
              text-[11px]
              font-medium
              !text-[#382925]
              backdrop-blur
              hover:bg-white
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span>
              {adding
                ? "Adding..."
                : availableStock >
                    0
                  ? "Add to bag"
                  : "Out of stock"}
            </span>

            {adding ? (
              <LoaderCircle
                className="size-4 animate-spin"
                strokeWidth={
                  1.4
                }
              />
            ) : (
              <ShoppingBag
                className="size-4"
                strokeWidth={
                  1.4
                }
              />
            )}
          </button>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex justify-between gap-3">
          <p className="text-[8px] font-medium uppercase tracking-[0.15em] !text-[#9a756c]">
            {
              product.family
            }{" "}
            ·{" "}
            {
              product.concentration
            }
          </p>

          {variant && (
            <span className="text-[8px] !text-[#9a756c]">
              {
                variant.size
              }
            </span>
          )}
        </div>

        <Link
          href={`/perfumes/${product.slug}`}
        >
          <h2 className="mt-3 font-display text-[26px] font-normal leading-none !text-[#382321]">
            {
              product.name
            }
          </h2>
        </Link>

        {product.shortDescription && (
          <p className="mt-2 text-[11px] leading-5 !text-[#8c7871]">
            {
              product.shortDescription
            }
          </p>
        )}

        {recommendation.reasons.length >
          0 && (
          <div className="mt-4 border-t border-[#e3dbd5] pt-3">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] !text-[#76524d]">
              Why it fits
            </p>

            <p className="mt-1.5 text-[9px] leading-5 !text-[#917c74]">
              {
                recommendation.reasons
                  .slice(
                    0,
                    2
                  )
                  .join(
                    " "
                  )
              }
            </p>
          </div>
        )}

        <p className="mt-3 text-[12px] font-medium !text-[#382824]">
          {price !== null
            ? currency.format(
                price
              )
            : "Price unavailable"}
        </p>
      </div>
    </motion.article>
  );
}

/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getPrimaryVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (variant) =>
        variant.active &&
        getVariantAvailableStock(
          variant
        ) > 0
    ) ??
    product.variants?.find(
      (variant) =>
        variant.active
    ) ??
    product.variants?.[0] ??
    null
  );
}

function getPrimaryPurchasableVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (variant) =>
        variant.active &&
        getVariantAvailableStock(
          variant
        ) > 0
    ) ??
    null
  );
}

function getVariantAvailableStock(
  variant:
    Product["variants"][number]
) {
  return Math.max(
    0,
    variant.stock -
      (
        variant.reservedStock ??
        0
      )
  );
}

function getPrimaryImage(
  product: Product
): string | null {
  const image =
    product.images?.[0];

  if (!image?.url) {
    return null;
  }

  const url =
    image.url.trim();

  return url || null;
}

function getNullableProductPrice(
  product: Product
): number | null {
  if (
    typeof product.startingPrice ===
      "number" &&
    Number.isFinite(
      product.startingPrice
    )
  ) {
    return product.startingPrice;
  }

  const variant =
    getPrimaryVariant(
      product
    );

  if (!variant) {
    return null;
  }

  const price =
    Number(
      variant.price
    );

  return Number.isFinite(
    price
  )
    ? price
    : null;
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorageList<T>(
  key: string
): T[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        key
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

function writeStorageList<T>(
  key: string,
  value: T[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(
      value
    )
  );
}

function dispatchCommerceEvent(
  eventName: string,
  count: number
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail: {
          count,
        },
      }
    )
  );
}
