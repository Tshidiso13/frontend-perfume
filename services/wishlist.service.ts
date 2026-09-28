"use client";

import {
  api,
} from "@/lib/api";

import type {
  Product,
} from "@/services/products.service";

export type WishlistItem = {
  id: string;
  createdAt: string;
  product: Product;
};

export type WishlistResponse = {
  data: WishlistItem[];
  total: number;
};

type GuestWishlistEntry = {
  productId: string;
  createdAt: string;
  product?: Product;
};

type PublicProductsResponse =
  | Product[]
  | {
      data?: Product[];
      products?: Product[];
    };

const GUEST_WISHLIST_KEY =
  "elan_wishlist";

export const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

export const wishlistService = {
  async getCount() {
    try {
      const backend =
        await api<{
          count: number;
        }>(
          "/wishlist/count"
        );

      const guest =
        readGuestWishlist();

      /*
       * If the user is authenticated but still has a guest
       * wishlist waiting to be imported, include those IDs in
       * the displayed count until getWishlist() performs the
       * actual database sync.
       */
      if (
        guest.length ===
        0
      ) {
        return backend;
      }

      return {
        count:
          Math.max(
            backend.count,
            guest.length
          ),
      };
    } catch (
      error
    ) {
      if (
        !isUnauthorized(
          error
        )
      ) {
        throw error;
      }

      return {
        count:
          readGuestWishlist()
            .length,
      };
    }
  },

  async getWishlist(): Promise<WishlistResponse> {
    try {
      const backend =
        await api<WishlistResponse>(
          "/wishlist"
        );

      const guestItems =
        readGuestWishlist();

      /*
       * We reached the protected backend successfully, so the
       * customer is authenticated. Import any wishlist they
       * built before signing in.
       */
      if (
        guestItems.length >
        0
      ) {
        const productIds =
          uniqueProductIds(
            guestItems
          );

        try {
          const synced =
            await api<WishlistResponse>(
              "/wishlist/sync",
              {
                method:
                  "POST",
                body:
                  JSON.stringify({
                    productIds,
                  }),
              }
            );

          /*
           * Clear localStorage only after PostgreSQL confirms
           * the merge succeeded.
           */
          clearGuestWishlist();

          return synced;
        } catch (
          syncError
        ) {
          /*
           * Do not lose the guest wishlist if syncing fails.
           * The signed-in database wishlist can still render
           * and another page load can retry the import.
           */
          console.warn(
            "Unable to sync guest wishlist into account.",
            syncError
          );
        }
      }

      return backend;
    } catch (
      error
    ) {
      if (
        !isUnauthorized(
          error
        )
      ) {
        throw error;
      }

      /*
       * Guest customer:
       * never force sign-in just to view saved fragrances.
       */
      return hydrateGuestWishlist();
    }
  },

  async add(
    productId: string,
    product?: Product
  ) {
    try {
      return await api<{
        message: string;
        item: WishlistItem;
      }>(
        `/wishlist/${productId}`,
        {
          method:
            "POST",
        }
      );
    } catch (
      error
    ) {
      if (
        !isUnauthorized(
          error
        )
      ) {
        throw error;
      }

      const current =
        readGuestWishlist();

      const existing =
        current.find(
          (
            item
          ) =>
            item.productId ===
            productId
        );

      if (
        existing
      ) {
        if (
          product &&
          !existing.product
        ) {
          writeGuestWishlist(
            current.map(
              (
                item
              ) =>
                item.productId ===
                productId
                  ? {
                      ...item,
                      product,
                    }
                  : item
            )
          );
        }

        const resolved =
          product ??
          existing.product ??
          (
            await findPublicProduct(
              productId
            )
          );

        return {
          message:
            "Already in your wishlist.",
          item:
            guestItemFromProduct(
              productId,
              resolved,
              existing.createdAt
            ),
        };
      }

      const createdAt =
        new Date()
          .toISOString();

      let resolvedProduct =
        product;

      if (
        !resolvedProduct
      ) {
        resolvedProduct =
          await findPublicProduct(
            productId
          );
      }

      writeGuestWishlist([
        ...current,
        {
          productId,
          createdAt,
          ...(resolvedProduct
            ? {
                product:
                  resolvedProduct,
              }
            : {}),
        },
      ]);

      return {
        message:
          "Added to your wishlist.",
        item:
          guestItemFromProduct(
            productId,
            resolvedProduct,
            createdAt
          ),
      };
    }
  },

  async remove(
    productId: string
  ) {
    try {
      return await api<{
        message: string;
      }>(
        `/wishlist/${productId}`,
        {
          method:
            "DELETE",
        }
      );
    } catch (
      error
    ) {
      if (
        !isUnauthorized(
          error
        )
      ) {
        throw error;
      }

      writeGuestWishlist(
        readGuestWishlist()
          .filter(
            (
              item
            ) =>
              item.productId !==
              productId
          )
      );

      return {
        message:
          "Removed from your wishlist.",
      };
    }
  },

  sync(
    productIds: string[]
  ) {
    return api<WishlistResponse>(
      "/wishlist/sync",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            productIds,
          }),
      }
    );
  },

  async syncGuestWishlist(): Promise<WishlistResponse> {
    const guestItems =
      readGuestWishlist();

    if (
      guestItems.length ===
      0
    ) {
      try {
        return await api<WishlistResponse>(
          "/wishlist"
        );
      } catch (
        error
      ) {
        if (
          isUnauthorized(
            error
          )
        ) {
          return {
            data: [],
            total: 0,
          };
        }

        throw error;
      }
    }

    try {
      const response =
        await this.sync(
          uniqueProductIds(
            guestItems
          )
        );

      clearGuestWishlist();

      return response;
    } catch (
      error
    ) {
      if (
        isUnauthorized(
          error
        )
      ) {
        /*
         * Still a guest. Keep localStorage untouched.
         */
        return hydrateGuestWishlist();
      }

      throw error;
    }
  },

  getGuestProductIds() {
    return uniqueProductIds(
      readGuestWishlist()
    );
  },

  clearGuestWishlist() {
    clearGuestWishlist();
  },
};

/* =========================================================
   GUEST WISHLIST
========================================================= */

async function hydrateGuestWishlist(): Promise<WishlistResponse> {
  const guestItems =
    readGuestWishlist();

  if (
    guestItems.length ===
    0
  ) {
    return {
      data: [],
      total: 0,
    };
  }

  const missingIds =
    guestItems
      .filter(
        (
          item
        ) =>
          !item.product
      )
      .map(
        (
          item
        ) =>
          item.productId
      );

  let publicProducts:
    Product[] =
    [];

  if (
    missingIds.length >
    0
  ) {
    publicProducts =
      await getPublicProductsSafely();
  }

  const productMap =
    new Map<
      string,
      Product
    >();

  for (
    const item
    of guestItems
  ) {
    if (
      item.product
    ) {
      productMap.set(
        item.productId,
        item.product
      );
    }
  }

  for (
    const product
    of publicProducts
  ) {
    if (
      product?.id
    ) {
      productMap.set(
        product.id,
        product
      );
    }
  }

  const hydratedEntries =
    guestItems.map(
      (
        item
      ) => {
        const product =
          productMap.get(
            item.productId
          );

        return product
          ? {
              ...item,
              product,
            }
          : item;
      }
    );

  writeGuestWishlist(
    hydratedEntries,
    false
  );

  const data =
    hydratedEntries.flatMap(
      (
        item
      ) => {
        if (
          !item.product
        ) {
          return [];
        }

        return [
          {
            id:
              `guest:${item.productId}`,
            createdAt:
              item.createdAt,
            product:
              item.product,
          },
        ];
      }
    );

  return {
    data,
    total:
      data.length,
  };
}

function guestItemFromProduct(
  productId: string,
  product:
    | Product
    | undefined,
  createdAt: string
): WishlistItem {
  if (
    !product
  ) {
    return {
      id:
        `guest:${productId}`,
      createdAt,
      product:
        {
          id:
            productId,
          slug:
            "",
          name:
            "Saved fragrance",
        } as Product,
    };
  }

  return {
    id:
      `guest:${productId}`,
    createdAt,
    product,
  };
}

/* =========================================================
   PRODUCT HYDRATION
========================================================= */

async function findPublicProduct(
  productId: string
): Promise<
  Product | undefined
> {
  const products =
    await getPublicProductsSafely();

  return products.find(
    (
      product
    ) =>
      product.id ===
      productId
  );
}

async function getPublicProductsSafely(): Promise<Product[]> {
  try {
    const response =
      await api<PublicProductsResponse>(
        "/products"
      );

    if (
      Array.isArray(
        response
      )
    ) {
      return response;
    }

    if (
      Array.isArray(
        response.data
      )
    ) {
      return response.data;
    }

    if (
      Array.isArray(
        response.products
      )
    ) {
      return response.products;
    }

    return [];
  } catch {
    return [];
  }
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function readGuestWishlist(): GuestWishlistEntry[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        GUEST_WISHLIST_KEY
      );

    if (
      !raw
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    const now =
      new Date()
        .toISOString();

    const normalized:
      GuestWishlistEntry[] =
      parsed.flatMap(
        (
          item
        ) => {
          /*
           * Backwards compatibility with:
           * ["productId1", "productId2"]
           */
          if (
            typeof item ===
            "string"
          ) {
            return [
              {
                productId:
                  item,
                createdAt:
                  now,
              },
            ];
          }

          if (
            !item ||
            typeof item !==
            "object"
          ) {
            return [];
          }

          const candidate =
            item as {
              productId?: unknown;
              createdAt?: unknown;
              product?: unknown;
            };

          if (
            typeof candidate.productId !==
              "string" ||
            !candidate.productId
          ) {
            return [];
          }

          return [
            {
              productId:
                candidate.productId,
              createdAt:
                typeof candidate.createdAt ===
                "string"
                  ? candidate.createdAt
                  : now,
              ...(candidate.product &&
              typeof candidate.product ===
                "object"
                ? {
                    product:
                      candidate.product as Product,
                  }
                : {}),
            },
          ];
        }
      );

    const seen =
      new Set<string>();

    return normalized.filter(
      (
        item
      ) => {
        if (
          seen.has(
            item.productId
          )
        ) {
          return false;
        }

        seen.add(
          item.productId
        );

        return true;
      }
    );
  } catch {
    return [];
  }
}

function writeGuestWishlist(
  items:
    GuestWishlistEntry[],
  emit =
    true
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    GUEST_WISHLIST_KEY,
    JSON.stringify(
      items
    )
  );

  if (
    emit
  ) {
    emitWishlistUpdated(
      items.length
    );
  }
}

function clearGuestWishlist() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    GUEST_WISHLIST_KEY
  );

  emitWishlistUpdated(
    0
  );
}

function emitWishlistUpdated(
  count?: number
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      WISHLIST_UPDATED_EVENT,
      {
        detail:
          typeof count ===
          "number"
            ? {
                count,
              }
            : undefined,
      }
    )
  );
}

function uniqueProductIds(
  items:
    GuestWishlistEntry[]
) {
  return Array.from(
    new Set(
      items.map(
        (
          item
        ) =>
          item.productId
      )
    )
  );
}

/* =========================================================
   AUTH ERROR DETECTION
========================================================= */

function isUnauthorized(
  error: unknown
) {
  const unauthorizedPattern =
    /401|unauthori[sz]ed|not authenticated|authentication required|sign in|session has expired/i;

  if (
    typeof error ===
    "string"
  ) {
    return unauthorizedPattern.test(
      error
    );
  }

  if (
    typeof Response !==
      "undefined" &&
    error instanceof
      Response
  ) {
    return (
      error.status ===
      401
    );
  }

  if (
    error instanceof
      Error
  ) {
    return unauthorizedPattern.test(
      error.message
    );
  }

  if (
    typeof error ===
      "object" &&
    error !==
      null
  ) {
    const candidate =
      error as {
        status?: unknown;
        statusCode?: unknown;
        message?: unknown;
        error?: unknown;
        detail?: unknown;
        response?: unknown;
      };

    if (
      Number(
        candidate.status
      ) ===
        401 ||
      Number(
        candidate.statusCode
      ) ===
        401
    ) {
      return true;
    }

    const textValues = [
      candidate.message,
      candidate.error,
      candidate.detail,
    ];

    for (
      const value
      of textValues
    ) {
      if (
        typeof value ===
          "string" &&
        unauthorizedPattern.test(
          value
        )
      ) {
        return true;
      }
    }

    if (
      typeof candidate.response ===
        "object" &&
      candidate.response !==
        null
    ) {
      const response =
        candidate.response as {
          status?: unknown;
          data?: unknown;
        };

      if (
        Number(
          response.status
        ) ===
        401
      ) {
        return true;
      }

      if (
        typeof response.data ===
          "object" &&
        response.data !==
          null
      ) {
        const data =
          response.data as {
            statusCode?: unknown;
            message?: unknown;
            error?: unknown;
          };

        if (
          Number(
            data.statusCode
          ) ===
            401 ||
          (
            typeof data.message ===
              "string" &&
            unauthorizedPattern.test(
              data.message
            )
          ) ||
          (
            typeof data.error ===
              "string" &&
            unauthorizedPattern.test(
              data.error
            )
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
