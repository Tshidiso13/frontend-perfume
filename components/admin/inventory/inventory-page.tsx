"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  ChevronDown,
  LoaderCircle,
  Minus,
  Package2,
  Plus,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  inventoryService,
  type InventoryItem,
  type InventoryStats,
} from "@/services/admin/admin-inventory.service";

/* =========================================================
   TYPES
========================================================= */

type StockStatus =
  | "In stock"
  | "Low stock"
  | "Out of stock";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_STATS: InventoryStats = {
  totalVariants: 0,
  totalUnits: 0,
  reservedUnits: 0,
  availableUnits: 0,
  inventoryValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
};

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style:
        "currency",
      currency:
        "ZAR",
      minimumFractionDigits:
        0,
      maximumFractionDigits:
        0,
    }
  );

/* =========================================================
   COMPONENT
========================================================= */

export function AdminInventoryPage() {
  const [
    inventory,
    setInventory,
  ] = useState<
    InventoryItem[]
  >([]);

  const [
    stats,
    setStats,
  ] =
    useState<InventoryStats>(
      EMPTY_STATS
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    savingIds,
    setSavingIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    family,
    setFamily,
  ] = useState("All");

  const [
    stockFilter,
    setStockFilter,
  ] = useState("All");

  /* =======================================================
     LOAD REAL INVENTORY
  ======================================================== */

  const loadInventory =
    useCallback(
      async (
        showLoader =
          true
      ) => {
        if (
          showLoader
        ) {
          setLoading(
            true
          );
        }

        setError(
          null
        );

        try {
          const response =
            await inventoryService.getInventory();

          setInventory(
            response.data ??
              []
          );

          setStats(
            response.stats ??
              EMPTY_STATS
          );
        } catch (
          error
        ) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load inventory."
          );
        } finally {
          if (
            showLoader
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  /* =======================================================
     FILTERS
  ======================================================== */

  const families =
    useMemo(() => {
      return [
        ...new Set(
          inventory
            .map(
              (item) =>
                item.family
                  .trim()
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(
            b
          )
      );
    }, [inventory]);

  const filteredInventory =
    useMemo(() => {
      let result = [
        ...inventory,
      ];

      const term =
        search
          .trim()
          .toLowerCase();

      if (term) {
        result =
          result.filter(
            (item) =>
              [
                item.name,
                item.family,
                item.size,
                item.sku,
              ]
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  term
                )
          );
      }

      if (
        family !==
        "All"
      ) {
        result =
          result.filter(
            (item) =>
              item.family ===
              family
          );
      }

      if (
        stockFilter !==
        "All"
      ) {
        result =
          result.filter(
            (item) =>
              getStockStatus(
                item
              ) ===
              stockFilter
          );
      }

      return result;
    }, [
      inventory,
      search,
      family,
      stockFilter,
    ]);

  const hasFilters =
    search.trim() !==
      "" ||
    family !==
      "All" ||
    stockFilter !==
      "All";

  function clearFilters() {
    setSearch("");
    setFamily(
      "All"
    );
    setStockFilter(
      "All"
    );
  }

  /* =======================================================
     LOCAL EDITING
  ======================================================== */

  function updateStock(
    id: string,
    amount: number
  ) {
    setInventory(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              id
            ) {
              return item;
            }

            const stock =
              Math.max(
                item.reservedStock,
                item.stock +
                  amount
              );

            return {
              ...item,
              stock,
              availableStock:
                Math.max(
                  0,
                  stock -
                    item.reservedStock
                ),
            };
          }
        )
    );
  }

  function setExactStock(
    id: string,
    value: number
  ) {
    setInventory(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              id
            ) {
              return item;
            }

            const stock =
              Math.max(
                item.reservedStock,
                Number.isFinite(
                  value
                )
                  ? Math.floor(
                      value
                    )
                  : item.reservedStock
              );

            return {
              ...item,
              stock,
              availableStock:
                Math.max(
                  0,
                  stock -
                    item.reservedStock
                ),
            };
          }
        )
    );
  }

  /* =======================================================
     SAVE TO NEST / PRISMA / NEON
  ======================================================== */

  async function saveStock(
    item: InventoryItem
  ) {
    if (
      savingIds.has(
        item.id
      )
    ) {
      return;
    }

    setSavingIds(
      (current) => {
        const next =
          new Set(
            current
          );

        next.add(
          item.id
        );

        return next;
      }
    );

    const toastId =
      toast.loading(
        `Saving ${item.name} ${item.size}...`
      );

    try {
      const response =
        await inventoryService.updateStock(
          item.id,
          {
            stock:
              item.stock,
          }
        );

      setInventory(
        (current) =>
          current.map(
            (currentItem) =>
              currentItem.id ===
              item.id
                ? response.item
                : currentItem
          )
      );

      toast.success(
        response.message ||
          `${item.name} inventory updated`,
        {
          id:
            toastId,

          description:
            `${response.item.size} · ${response.item.availableStock} units available`,
        }
      );

      /*
       * Refresh the authoritative summary cards
       * after the stock write succeeds.
       */
      await loadInventory(
        false
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to update inventory.",
        {
          id:
            toastId,
        }
      );

      /*
       * Restore the real backend value if saving failed.
       */
      await loadInventory(
        false
      );
    } finally {
      setSavingIds(
        (current) => {
          const next =
            new Set(
              current
            );

          next.delete(
            item.id
          );

          return next;
        }
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-6 animate-spin !text-[#5a1425]"
          strokeWidth={
            1.4
          }
        />

        <p className="mt-4 text-[9px] !text-[#88766f]">
          Loading inventory...
        </p>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================== */

  if (error) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center">
        <Package2
          className="size-6 !text-[#9a8178]"
          strokeWidth={
            1.3
          }
        />

        <h1 className="mt-5 font-display text-[38px] !text-[#382724]">
          Inventory unavailable.
        </h1>

        <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#88766f]">
          {
            error
          }
        </p>

        <button
          type="button"
          onClick={() =>
            void loadInventory()
          }
          className="mt-7 inline-flex items-center gap-3 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
        >
          <RefreshCcw
            className="size-3.5"
            strokeWidth={
              1.4
            }
          />

          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                Élan Parfums / Back office
              </p>

              <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                Inventory
              </h1>

              <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                Live inventory from
                your product variants
                in Neon. Reserved
                units are protected
                from manual stock
                reductions.
              </p>
            </div>

            <Link
              href="/admin/products/create"
              className="group inline-flex min-h-[48px] w-fit items-center gap-8 bg-[#5a1425] px-6 text-[10px] font-medium !text-white transition-colors hover:bg-[#6b1b2f]"
            >
              Add fragrance

              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={
                  1.4
                }
              />
            </Link>
          </div>

          {/* =====================================================
              STATS
          ====================================================== */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total units"
              value={
                stats.totalUnits.toString()
              }
              helper={`${stats.availableUnits} available · ${stats.reservedUnits} reserved`}
            />

            <StatCard
              label="Inventory value"
              value={
                currency.format(
                  stats.inventoryValue
                )
              }
              helper="Current retail value"
            />

            <StatCard
              label="Low stock"
              value={
                stats.lowStockCount.toString()
              }
              helper="Available stock at or below threshold"
            />

            <StatCard
              label="Out of stock"
              value={
                stats.outOfStockCount.toString()
              }
              helper="No units currently available"
            />
          </div>

          {/* =====================================================
              FILTERS
          ====================================================== */}

          <div className="mt-6 border-y border-[#ded6cf] py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_170px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 !text-[#74625c]"
                  strokeWidth={
                    1.4
                  }
                />

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search product, size or SKU..."
                  className="h-[52px] w-full bg-[#f1eeea] pl-11 pr-11 text-[10px] !text-[#3d302c] outline-none placeholder:!text-[#9b8e88] focus:bg-[#ece8e3]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#74625c]"
                  >
                    <X
                      className="size-3.5"
                      strokeWidth={
                        1.4
                      }
                    />
                  </button>
                )}
              </div>

              <FilterSelect
                label="Fragrance family"
                value={
                  family
                }
                onChange={
                  setFamily
                }
                options={[
                  "All",
                  ...families,
                ]}
              />

              <FilterSelect
                label="Stock status"
                value={
                  stockFilter
                }
                onChange={
                  setStockFilter
                }
                options={[
                  "All",
                  "In stock",
                  "Low stock",
                  "Out of stock",
                ]}
              />
            </div>
          </div>

          {/* META */}

          <div className="flex min-h-[58px] items-center justify-between">
            <p className="text-[9px] !text-[#8f817b]">
              {
                filteredInventory.length
              }{" "}
              {filteredInventory.length ===
              1
                ? "variant"
                : "variants"}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="border-b border-[#5a1425] pb-1 text-[8px] font-medium !text-[#5a1425]"
              >
                Clear filters
              </button>
            ) : (
              <p className="hidden text-[8px] uppercase tracking-[0.16em] !text-[#a08c84] sm:block">
                {
                  stats.totalVariants
                }{" "}
                catalogue variants
              </p>
            )}
          </div>

          {/* =====================================================
              DESKTOP TABLE
          ====================================================== */}

          {filteredInventory.length >
            0 && (
            <div className="hidden overflow-x-auto border border-[#e5ddd3] bg-[#fbfaf7] md:block">
              <div className="min-w-[1050px]">
                <div className="grid grid-cols-[72px_1.25fr_0.65fr_1fr_0.8fr_1fr_1fr_200px] border-b border-[#e5ddd3] bg-[#f5f0ea] px-5 py-4">
                  <TableHeading>
                    Product
                  </TableHeading>

                  <TableHeading>
                    Name
                  </TableHeading>

                  <TableHeading>
                    Size
                  </TableHeading>

                  <TableHeading>
                    SKU
                  </TableHeading>

                  <TableHeading>
                    Price
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading>
                    Availability
                  </TableHeading>

                  <TableHeading align="right">
                    Stock on hand
                  </TableHeading>
                </div>

                {filteredInventory.map(
                  (
                    item
                  ) => {
                    const saving =
                      savingIds.has(
                        item.id
                      );

                    return (
                      <div
                        key={
                          item.id
                        }
                        className="grid min-h-[104px] grid-cols-[72px_1.25fr_0.65fr_1fr_0.8fr_1fr_1fr_200px] items-center border-b border-[#e5ddd3] px-5 transition-colors last:border-b-0 hover:bg-[#faf7f3]"
                      >
                        <ProductImage
                          item={
                            item
                          }
                          size={
                            54
                          }
                        />

                        <div className="min-w-0 pr-4">
                          <Link
                            href={`/admin/products/${item.productId}`}
                          >
                            <p className="truncate font-display text-[18px] !text-[#382724] transition-opacity hover:opacity-60">
                              {
                                item.name
                              }
                            </p>
                          </Link>

                          <p className="mt-1 text-[8px] uppercase tracking-[0.13em] !text-[#9a8279]">
                            {
                              item.family
                            }
                          </p>
                        </div>

                        <p className="text-[9px] font-medium !text-[#574640]">
                          {
                            item.size
                          }
                        </p>

                        <p className="text-[8px] !text-[#8d7a73]">
                          {
                            item.sku
                          }
                        </p>

                        <p className="text-[9px] font-medium !text-[#473632]">
                          {currency.format(
                            item.price
                          )}
                        </p>

                        <div>
                          <StockBadge
                            item={
                              item
                            }
                          />

                          <p className="mt-2 text-[7px] !text-[#9a8982]">
                            Threshold{" "}
                            {
                              item.threshold
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium !text-[#4f6255]">
                            {
                              item.availableStock
                            }{" "}
                            available
                          </p>

                          <p className="mt-1 text-[7px] !text-[#9a8982]">
                            {
                              item.reservedStock
                            }{" "}
                            reserved
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={
                              saving ||
                              item.stock <=
                                item.reservedStock
                            }
                            onClick={() =>
                              updateStock(
                                item.id,
                                -1
                              )
                            }
                            aria-label={`Decrease ${item.name} ${item.size} stock`}
                            className="flex size-8 items-center justify-center border border-[#ddd4ce] !text-[#6f5d56] transition-colors hover:bg-[#f0ebe6] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Minus
                              className="size-3"
                              strokeWidth={
                                1.4
                              }
                            />
                          </button>

                          <input
                            type="number"
                            min={
                              item.reservedStock
                            }
                            value={
                              item.stock
                            }
                            disabled={
                              saving
                            }
                            onChange={(
                              event
                            ) =>
                              setExactStock(
                                item.id,
                                Number(
                                  event.target.value
                                )
                              )
                            }
                            className="h-8 w-[58px] border border-[#ddd4ce] bg-transparent text-center text-[9px] !text-[#42332e] outline-none focus:border-[#7e4c55] disabled:opacity-50"
                          />

                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              updateStock(
                                item.id,
                                1
                              )
                            }
                            aria-label={`Increase ${item.name} ${item.size} stock`}
                            className="flex size-8 items-center justify-center border border-[#ddd4ce] !text-[#6f5d56] transition-colors hover:bg-[#f0ebe6] disabled:opacity-50"
                          >
                            <Plus
                              className="size-3"
                              strokeWidth={
                                1.4
                              }
                            />
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void saveStock(
                                item
                              )
                            }
                            className="ml-1 flex min-h-[32px] min-w-[58px] items-center justify-center bg-[#5a1425] px-3 text-[8px] font-medium !text-white hover:bg-[#6b1b2f] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving ? (
                              <LoaderCircle
                                className="size-3 animate-spin"
                                strokeWidth={
                                  1.4
                                }
                              />
                            ) : (
                              "Save"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              MOBILE CARDS
          ====================================================== */}

          {filteredInventory.length >
            0 && (
            <div className="grid gap-3 md:hidden">
              {filteredInventory.map(
                (
                  item
                ) => {
                  const saving =
                    savingIds.has(
                      item.id
                    );

                  return (
                    <article
                      key={
                        item.id
                      }
                      className="border border-[#e5ddd3] bg-[#fbfaf7] p-4"
                    >
                      <div className="flex gap-4">
                        <ProductImage
                          item={
                            item
                          }
                          size={
                            84
                          }
                          mobile
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${item.productId}`}
                              >
                                <h2 className="truncate font-display text-[21px] !text-[#382724]">
                                  {
                                    item.name
                                  }
                                </h2>
                              </Link>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] !text-[#9a8279]">
                                {
                                  item.family
                                }{" "}
                                ·{" "}
                                {
                                  item.size
                                }
                              </p>
                            </div>

                            <StockBadge
                              item={
                                item
                              }
                            />
                          </div>

                          <p className="mt-4 text-[8px] !text-[#9a8982]">
                            {
                              item.sku
                            }
                          </p>

                          <p className="mt-2 text-[10px] font-medium !text-[#45332f]">
                            {currency.format(
                              item.price
                            )}
                          </p>

                          <p className="mt-2 text-[8px] !text-[#8b7972]">
                            {
                              item.availableStock
                            }{" "}
                            available ·{" "}
                            {
                              item.reservedStock
                            }{" "}
                            reserved
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[#e5ddd3] pt-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9a8982]">
                              Stock on hand
                            </p>

                            <p className="mt-1 font-display text-[25px] !text-[#382724]">
                              {
                                item.stock
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={
                                saving ||
                                item.stock <=
                                  item.reservedStock
                              }
                              onClick={() =>
                                updateStock(
                                  item.id,
                                  -1
                                )
                              }
                              className="flex size-9 items-center justify-center border border-[#ddd4ce] disabled:opacity-35"
                            >
                              <Minus
                                className="size-3"
                                strokeWidth={
                                  1.4
                                }
                              />
                            </button>

                            <input
                              type="number"
                              min={
                                item.reservedStock
                              }
                              value={
                                item.stock
                              }
                              disabled={
                                saving
                              }
                              onChange={(
                                event
                              ) =>
                                setExactStock(
                                  item.id,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                              className="h-9 w-[58px] border border-[#ddd4ce] bg-transparent text-center text-[9px] outline-none disabled:opacity-50"
                            />

                            <button
                              type="button"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                updateStock(
                                  item.id,
                                  1
                                )
                              }
                              className="flex size-9 items-center justify-center border border-[#ddd4ce] disabled:opacity-50"
                            >
                              <Plus
                                className="size-3"
                                strokeWidth={
                                  1.4
                                }
                              />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            void saveStock(
                              item
                            )
                          }
                          className="mt-4 flex min-h-[42px] w-full items-center justify-center bg-[#5a1425] text-[9px] font-medium !text-white disabled:opacity-60"
                        >
                          {saving ? (
                            <LoaderCircle
                              className="size-3.5 animate-spin"
                              strokeWidth={
                                1.4
                              }
                            />
                          ) : (
                            "Save stock"
                          )}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

          {/* =====================================================
              EMPTY
          ====================================================== */}

          {filteredInventory.length ===
            0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center border border-[#e5ddd3] px-5 text-center">
              <Package2
                className="size-5 !text-[#9a8178]"
                strokeWidth={
                  1.3
                }
              />

              <p className="mt-6 text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
                Nothing matched
              </p>

              <h2 className="mt-4 font-display text-[34px] !text-[#382724]">
                No inventory found.
              </h2>

              <p className="mt-3 max-w-sm text-[10px] leading-5 !text-[#8b7972]">
                Try another
                fragrance, SKU or
                stock status.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-6 border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  item,
  size,
  mobile = false,
}: {
  item: InventoryItem;
  size: number;
  mobile?: boolean;
}) {
  const className =
    mobile
      ? "relative h-[105px] w-[84px] shrink-0 overflow-hidden bg-[#e8e3dd]"
      : "relative size-[54px] overflow-hidden bg-[#e8e3dd]";

  return (
    <Link
      href={`/admin/products/${item.productId}`}
      className={
        className
      }
    >
      {item.imageUrl ? (
        <Image
          src={
            item.imageUrl
          }
          alt={
            item.name
          }
          fill
          sizes={`${size}px`}
          unoptimized
          className="object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Package2
            className="size-5 !text-[#aa9991]"
            strokeWidth={
              1.2
            }
          />
        </span>
      )}
    </Link>
  );
}

/* =========================================================
   STOCK HELPERS
========================================================= */

function getStockStatus(
  item: InventoryItem
): StockStatus {
  if (
    item.availableStock <=
    0
  ) {
    return "Out of stock";
  }

  if (
    item.availableStock <=
    item.threshold
  ) {
    return "Low stock";
  }

  return "In stock";
}

function StockBadge({
  item,
}: {
  item: InventoryItem;
}) {
  const status =
    getStockStatus(
      item
    );

  const styles: Record<
    StockStatus,
    string
  > = {
    "In stock":
      "bg-[#e8eee8] !text-[#526357]",

    "Low stock":
      "bg-[#f4e6e2] !text-[#9c574b]",

    "Out of stock":
      "bg-[#f1e3e3] !text-[#9b4d4d]",
  };

  return (
    <span
      className={`inline-flex w-fit shrink-0 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] ${styles[status]}`}
    >
      {
        status
      }
    </span>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="min-h-[150px] border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <p className="text-[9px] !text-[#8a7770]">
        {
          label
        }
      </p>

      <p className="mt-5 font-display text-[36px] leading-none tracking-[-0.03em] !text-[#2e1e1d]">
        {
          value
        }
      </p>

      <p className="mt-5 text-[9px] leading-5 !text-[#9a8a84]">
        {
          helper
        }
      </p>
    </article>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="mb-1 text-[8px] !text-[#86746d]">
        {
          label
        }
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-[10px] !text-[#3d302c] outline-none"
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {
                option
              }
            </option>
          )
        )}
      </select>

      <ChevronDown
        className="pointer-events-none absolute bottom-[10px] right-2 size-3.5 !text-[#382b28]"
        strokeWidth={
          1.4
        }
      />
    </label>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
  align =
    "left",
}: {
  children:
    React.ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <p
      className={`text-[8px] font-medium uppercase tracking-[0.15em] !text-[#917d75] ${
        align ===
        "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {
        children
      }
    </p>
  );
}
