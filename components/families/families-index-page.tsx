"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";

import {
  familiesService,
  type FamilySummary,
} from "@/services/families.service";

export function FamiliesIndexPage() {
  const [
    families,
    setFamilies,
  ] = useState<
    FamilySummary[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted =
      true;

    async function loadFamilies() {
      try {
        setLoading(
          true
        );

        setError(
          null
        );

        const response =
          await familiesService.getFamilies();

        if (
          mounted
        ) {
          setFamilies(
            response.data ??
              []
          );
        }
      } catch (
        error
      ) {
        if (
          mounted
        ) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load fragrance families."
          );
        }
      } finally {
        if (
          mounted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    void loadFamilies();

    return () => {
      mounted =
        false;
    };
  }, []);

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Families
          </span>
        </div>

        <div className="pb-10">
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Discover by character
          </p>

          <h1 className="font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px] lg:text-[72px]">
            Fragrance families.
          </h1>

          <p className="mt-5 max-w-xl text-[12px] leading-6 !text-[#8b7972]">
            Explore the families currently represented in the
            Élan collection.
          </p>
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#5a1425]"
              strokeWidth={
                1.4
              }
            />
          </div>
        )}

        {!loading &&
          error && (
            <div className="flex min-h-[360px] items-center justify-center px-5 text-center">
              <p className="max-w-md text-[11px] leading-6 !text-[#8d7b74]">
                {
                  error
                }
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          families.length >
            0 && (
            <div className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-3">
              {families.map(
                (
                  family,
                  index
                ) => (
                  <Link
                    key={
                      family.slug
                    }
                    href={`/families/${family.slug}`}
                    className="group flex min-h-[190px] flex-col justify-between border border-[#e4dbd3] bg-[#f7f2ec] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[#f3ece5]"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <span className="text-[9px] tracking-[0.16em] !text-[#a18479]">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <ArrowUpRight
                        className="size-4 !text-[#8b665d] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={
                          1.4
                        }
                      />
                    </div>

                    <div>
                      <h2 className="font-display text-[32px] font-normal leading-none !text-[#382724]">
                        {
                          family.name
                        }
                      </h2>

                      <p className="mt-3 text-[9px] !text-[#8f7c75]">
                        {
                          family.productCount
                        }{" "}
                        {family.productCount ===
                        1
                          ? "fragrance"
                          : "fragrances"}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

        {!loading &&
          !error &&
          families.length ===
            0 && (
            <div className="flex min-h-[360px] items-center justify-center text-center">
              <p className="font-display text-[34px] !text-[#382724]">
                No fragrance families yet.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
