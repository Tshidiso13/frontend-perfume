"use client";

import { api } from "@/lib/api";

export type CartItem = {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  family: string;
  concentration: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
  stock: number;
  reservedStock: number;
  availableStock: number;
  active: boolean;
  productStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  canPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
  freeDeliveryThreshold: number;
  amountUntilFreeDelivery: number;
  freeDeliveryUnlocked: boolean;
};

export type CartResponse = {
  data: CartItem[];
  summary: CartSummary;
};

export type CartMutationResponse =
  CartResponse & {
    message: string;
  };

export type SyncCartItem = {
  variantId: string;
  quantity: number;
};

export type SyncCartResponse =
  CartResponse & {
    imported: number;
    ignored: number;
  };

type CheckoutPreview = {
  items: Array<{
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    family: string;
    concentration: string;
    size: string;
    sku: string;
    imageUrl: string | null;
    price: number;
    quantity: number;
    lineTotal: number;
    availableStock: number;
  }>;
  freeDeliveryThreshold: number;
};

type GuestStoredItem = {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  shortDescription?: string;
  family?: string;
  concentration?: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  availableStock?: number;
  createdAt?: string;
  updatedAt?: string;
};

type GuestWishlistItem = {
  productId: string;
  slug: string;
  name: string;
  family: string;
  concentration: string;
  imageUrl: string | null;
  startingPrice: number | null;
  createdAt: string;
};

const GUEST_CART_KEY = "elan_cart";
const GUEST_WISHLIST_KEY = "elan_wishlist";
const DEFAULT_FREE_DELIVERY_THRESHOLD = 2500;

export const cartService = {
  async getCount() {
    try {
      return await api<{ count: number }>("/cart/count");
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      return {
        count: readGuestCart().reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        ),
      };
    }
  },

  async getCart(): Promise<CartResponse> {
    try {
      return await api<CartResponse>("/cart");
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      return guestResponse();
    }
  },

  async add(
    variantId: string,
    quantity = 1
  ): Promise<CartMutationResponse> {
    try {
      return await api<CartMutationResponse>("/cart", {
        method: "POST",
        body: JSON.stringify({
          variantId,
          quantity,
        }),
      });
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      const safeQuantity = Math.min(
        99,
        Math.max(1, quantity)
      );

      const existing = readGuestCart();

      const current = existing.find(
        (item) => item.variantId === variantId
      );

      const nextQuantity = Math.min(
        99,
        (current?.quantity ?? 0) + safeQuantity
      );

      /*
       * The guest cart is still validated by NestJS.
       * We never trust product name, price or stock from localStorage.
       */
      const preview = await previewGuestLine(
        variantId,
        nextQuantity
      );

      const item = preview.items[0];

      if (!item) {
        throw new Error(
          "This fragrance is no longer available."
        );
      }

      const now = new Date().toISOString();

      const stored: GuestStoredItem = {
        id: `guest:${variantId}`,
        productId: item.productId,
        variantId: item.variantId,
        slug: item.slug,
        name: item.name,
        shortDescription:
          current?.shortDescription ?? "",
        family: item.family,
        concentration: item.concentration,
        size: item.size,
        sku: item.sku,
        price: Number(item.price),
        quantity: Number(item.quantity),
        imageUrl: item.imageUrl,
        availableStock: Number(item.availableStock),
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      };

      const next = current
        ? existing.map((row) =>
            row.variantId === variantId
              ? stored
              : row
          )
        : [...existing, stored];

      writeGuestCart(next);

      return {
        ...guestResponse(
          preview.freeDeliveryThreshold
        ),
        message: `${item.name} added to your bag.`,
      };
    }
  },

  async updateQuantity(
    itemId: string,
    quantity: number
  ): Promise<CartMutationResponse> {
    if (isGuestId(itemId)) {
      return updateGuestQuantity(
        itemId,
        quantity
      );
    }

    try {
      return await api<CartMutationResponse>(
        `/cart/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            quantity,
          }),
        }
      );
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      /*
       * If the user logged out while the drawer still held
       * authenticated item IDs, fall back to the guest cart.
       */
      const guest = readGuestCart();

      const matchingGuest = guest.find(
        (item) =>
          item.id === itemId ||
          item.variantId === itemId
      );

      if (!matchingGuest) {
        return {
          ...guestResponse(),
          message: "Bag refreshed.",
        };
      }

      return updateGuestQuantity(
        matchingGuest.id,
        quantity
      );
    }
  },

  async remove(
    itemId: string
  ): Promise<CartMutationResponse> {
    if (isGuestId(itemId)) {
      return removeGuest(itemId);
    }

    try {
      return await api<CartMutationResponse>(
        `/cart/${itemId}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      return removeGuest(itemId);
    }
  },

  async clear(): Promise<CartMutationResponse> {
    try {
      const response =
        await api<CartMutationResponse>(
          "/cart",
          {
            method: "DELETE",
          }
        );

      writeGuestCart([]);

      return response;
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      writeGuestCart([]);

      return {
        ...guestResponse(),
        message: "Your bag is empty.",
      };
    }
  },

  async moveToWishlist(
    itemId: string
  ): Promise<CartMutationResponse> {
    if (isGuestId(itemId)) {
      return moveGuestToWishlist(itemId);
    }

    try {
      return await api<CartMutationResponse>(
        `/cart/${itemId}/move-to-wishlist`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      return moveGuestToWishlist(itemId);
    }
  },

  async sync(
    items: SyncCartItem[]
  ): Promise<SyncCartResponse> {
    return api<SyncCartResponse>(
      "/cart/sync",
      {
        method: "POST",
        body: JSON.stringify({
          items,
        }),
      }
    );
  },

  /**
   * Call this after successful login if you want the browser's
   * guest bag merged into the authenticated database cart.
   */
  async syncGuestCart(): Promise<CartResponse> {
    const guestItems = readGuestCart().map(
      (item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })
    );

    if (guestItems.length === 0) {
      return this.getCart();
    }

    const result = await this.sync(
      guestItems
    );

    writeGuestCart([]);

    return {
      data: result.data,
      summary: result.summary,
    };
  },

  getGuestCheckoutItems(): SyncCartItem[] {
    return readGuestCart().map(
      (item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })
    );
  },
};

/* =========================================================
   GUEST HELPERS
========================================================= */

async function previewGuestLine(
  variantId: string,
  quantity: number
) {
  return api<CheckoutPreview>(
    "/checkout/preview",
    {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            variantId,
            quantity,
          },
        ],
        deliveryMethod: "ARAMEX",
      }),
    }
  );
}

async function updateGuestQuantity(
  itemId: string,
  quantity: number
): Promise<CartMutationResponse> {
  if (quantity <= 0) {
    return removeGuest(itemId);
  }

  const items = readGuestCart();

  const variantId =
    guestVariantId(itemId);

  const current = items.find(
    (item) =>
      item.variantId === variantId ||
      item.id === itemId
  );

  if (!current) {
    throw new Error(
      "This bag item could not be found."
    );
  }

  const safeQuantity = Math.min(
    99,
    Math.max(1, quantity)
  );

  const preview = await previewGuestLine(
    current.variantId,
    safeQuantity
  );

  const fresh = preview.items[0];

  if (!fresh) {
    throw new Error(
      "This fragrance is no longer available."
    );
  }

  const next = items.map((item) =>
    item.variantId === current.variantId
      ? {
          ...item,
          id: `guest:${fresh.variantId}`,
          productId: fresh.productId,
          slug: fresh.slug,
          name: fresh.name,
          family: fresh.family,
          concentration: fresh.concentration,
          size: fresh.size,
          sku: fresh.sku,
          price: Number(fresh.price),
          quantity: Number(fresh.quantity),
          imageUrl: fresh.imageUrl,
          availableStock: Number(
            fresh.availableStock
          ),
          updatedAt:
            new Date().toISOString(),
        }
      : item
  );

  writeGuestCart(next);

  return {
    ...guestResponse(
      preview.freeDeliveryThreshold
    ),
    message: "Bag quantity updated.",
  };
}

function removeGuest(
  itemId: string
): CartMutationResponse {
  const variantId =
    guestVariantId(itemId);

  const current = readGuestCart();

  const removed = current.find(
    (item) =>
      item.id === itemId ||
      item.variantId === variantId
  );

  writeGuestCart(
    current.filter(
      (item) =>
        item.id !== itemId &&
        item.variantId !== variantId
    )
  );

  return {
    ...guestResponse(),
    message: removed
      ? `${removed.name} removed from your bag.`
      : "Bag item removed.",
  };
}

function moveGuestToWishlist(
  itemId: string
): CartMutationResponse {
  const variantId =
    guestVariantId(itemId);

  const cart = readGuestCart();

  const item = cart.find(
    (row) =>
      row.id === itemId ||
      row.variantId === variantId
  );

  if (!item) {
    throw new Error(
      "This bag item could not be found."
    );
  }

  const wishlist =
    readStorage<GuestWishlistItem>(
      GUEST_WISHLIST_KEY
    );

  const alreadySaved = wishlist.some(
    (row) =>
      row.productId === item.productId
  );

  if (!alreadySaved) {
    wishlist.push({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      family: item.family ?? "",
      concentration:
        item.concentration ?? "",
      imageUrl: item.imageUrl,
      startingPrice: item.price,
      createdAt:
        new Date().toISOString(),
    });

    writeStorage(
      GUEST_WISHLIST_KEY,
      wishlist
    );
  }

  writeGuestCart(
    cart.filter(
      (row) =>
        row.variantId !== item.variantId
    )
  );

  return {
    ...guestResponse(),
    message:
      `${item.name} moved to your wishlist.`,
  };
}

function guestResponse(
  freeDeliveryThreshold =
    DEFAULT_FREE_DELIVERY_THRESHOLD
): CartResponse {
  const stored = readGuestCart();

  const data: CartItem[] =
    stored.map((item) => {
      const availableStock =
        Number(
          item.availableStock ??
            Math.max(
              Number(item.quantity),
              1
            )
        );

      const price =
        Number(item.price);

      const quantity =
        Number(item.quantity);

      return {
        id:
          item.id ||
          `guest:${item.variantId}`,
        variantId: item.variantId,
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        shortDescription:
          item.shortDescription ?? "",
        family: item.family ?? "",
        concentration:
          item.concentration ?? "",
        size: item.size,
        sku: item.sku,
        price,
        quantity,
        lineTotal:
          money(price * quantity),
        imageUrl: item.imageUrl,
        stock: availableStock,
        reservedStock: 0,
        availableStock,
        active: true,
        productStatus: "ACTIVE",
        canPurchase:
          availableStock >= quantity,
        createdAt:
          item.createdAt ??
          new Date().toISOString(),
        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      };
    });

  const itemCount =
    data.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const subtotal =
    money(
      data.reduce(
        (total, item) =>
          total + item.lineTotal,
        0
      )
    );

  const threshold =
    Math.max(
      0,
      Number(freeDeliveryThreshold)
    );

  return {
    data,
    summary: {
      itemCount,
      subtotal,
      freeDeliveryThreshold:
        threshold,
      amountUntilFreeDelivery:
        money(
          Math.max(
            0,
            threshold - subtotal
          )
        ),
      freeDeliveryUnlocked:
        threshold > 0 &&
        subtotal >= threshold,
    },
  };
}

function readGuestCart() {
  return readStorage<GuestStoredItem>(
    GUEST_CART_KEY
  );
}

function writeGuestCart(
  items: GuestStoredItem[]
) {
  writeStorage(
    GUEST_CART_KEY,
    items
  );

  if (
    typeof window !==
    "undefined"
  ) {
    const count =
      items.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      );

    window.dispatchEvent(
      new CustomEvent(
        "elan:cart-updated",
        {
          detail: {
            count,
          },
        }
      )
    );
  }
}

function readStorage<T>(
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
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(
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
    JSON.stringify(value)
  );
}

function guestVariantId(
  itemId: string
) {
  return itemId.startsWith(
    "guest:"
  )
    ? itemId.slice(
        "guest:".length
      )
    : itemId;
}

function isGuestId(
  itemId: string
) {
  return itemId.startsWith(
    "guest:"
  );
}

function isUnauthorized(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null
  ) {
    const value = error as {
      status?: unknown;
      statusCode?: unknown;
      message?: unknown;
    };

    if (
      Number(value.status) === 401 ||
      Number(value.statusCode) === 401
    ) {
      return true;
    }

    if (
      typeof value.message ===
        "string" &&
      /401|unauthori[sz]ed|sign in|session has expired/i.test(
        value.message
      )
    ) {
      return true;
    }
  }

  return (
    error instanceof Error &&
    /401|unauthori[sz]ed|sign in|session has expired/i.test(
      error.message
    )
  );
}

function money(
  value: number
) {
  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) *
        100
    ) /
    100
  );
}
