import type { Metadata } from "next";

import {
  notFound,
} from "next/navigation";

import {
  cache,
} from "react";

import {
  ProductDetail,
} from "@/components/product/product-details";

import type {
  Product,
} from "@/services/products.service";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  (
    process.env
      .NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api"
  ).replace(
    /\/+$/,
    ""
  );

/* =========================================================
   TYPES
========================================================= */

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PublicProductsResponse = {
  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

/*
 * Keep this export temporarily if ProductDetail
 * imports Perfume from this page.
 *
 * It now represents the REAL backend Product type.
 */
export type Perfume =
  Product;

/* =========================================================
   GET SINGLE PRODUCT
========================================================= */

const getProductBySlug =
  cache(
    async (
      slug: string
    ): Promise<
      Product | null
    > => {
      const normalizedSlug =
        slug
          .trim()
          .toLowerCase();

      if (
        !normalizedSlug
      ) {
        return null;
      }

      const response =
        await fetch(
          `${API_URL}/products/${encodeURIComponent(
            normalizedSlug
          )}`,
          {
            /*
             * Product changes made in the
             * admin should appear immediately.
             */
            cache:
              "no-store",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        response.status ===
        404
      ) {
        return null;
      }

      if (
        !response.ok
      ) {
        throw new Error(
          `Unable to load fragrance (${response.status}).`
        );
      }

      return (
        await response.json()
      ) as Product;
    }
  );

/* =========================================================
   GET RELATED PRODUCTS
========================================================= */

async function getRelatedProducts(
  product: Product
): Promise<Product[]> {
  const params =
    new URLSearchParams();

  /*
   * Related fragrances from
   * the same family.
   */
  if (
    product.family?.trim()
  ) {
    params.set(
      "family",
      product.family.trim()
    );
  }

  params.set(
    "page",
    "1"
  );

  /*
   * Request one extra because
   * current product may be included.
   */
  params.set(
    "limit",
    "5"
  );

  try {
    const response =
      await fetch(
        `${API_URL}/products?${params.toString()}`,
        {
          cache:
            "no-store",

          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (
      !response.ok
    ) {
      return [];
    }

    const result =
      (await response.json()) as PublicProductsResponse;

    return (
      result.data ?? []
    )
      .filter(
        (item) =>
          item.id !==
          product.id
      )
      .slice(
        0,
        4
      );
  } catch {
    /*
     * Related products should never
     * prevent the main fragrance page
     * from loading.
     */
    return [];
  }
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    id,
  } = await params;

  let product:
    | Product
    | null =
    null;

  try {
    product =
      await getProductBySlug(
        id
      );
  } catch {
    return {
      title:
        "Fragrance | Élan Parfums",
    };
  }

  if (!product) {
    return {
      title:
        "Fragrance Not Found | Élan Parfums",

      description:
        "This fragrance could not be found.",
    };
  }

  const imageUrl =
    getPrimaryImage(
      product
    );

  const title =
    product.seoTitle?.trim() ||
    product.name;

  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    undefined;

  return {
    title,
    description,

    openGraph: {
      title,
      description,

      type:
        "website",

      ...(imageUrl
        ? {
            images: [
              {
                url:
                  imageUrl,

                alt:
                  product.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card:
        "summary_large_image",

      title,
      description,

      ...(imageUrl
        ? {
            images: [
              imageUrl,
            ],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function PerfumePage({
  params,
}: PageProps) {
  const {
    id,
  } = await params;

  const product =
    await getProductBySlug(
      id
    );

  if (!product) {
    notFound();
  }

  const relatedProducts =
    await getRelatedProducts(
      product
    );

  return (
    <ProductDetail
      product={
        product
      }
      relatedProducts={
        relatedProducts
      }
    />
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getPrimaryImage(
  product: Product
): string | null {
  const image =
    product.images?.[0];

  if (!image) {
    return null;
  }

  const url =
    image.url?.trim();

  return url || null;
}