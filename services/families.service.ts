import {
  api,
} from "@/lib/api";

import type {
  Product,
  ProductPagination,
} from "@/services/products.service";

export type FamilySummary = {
  name: string;
  slug: string;
  productCount: number;
};

export type FamiliesResponse = {
  data: FamilySummary[];
};

export type FamilyProductsQuery = {
  search?: string;

  audience?:
    | "WOMEN"
    | "MEN"
    | "UNISEX";

  page?: number;
  limit?: number;
};

export type FamilyProductsResponse = {
  family: FamilySummary;
  data: Product[];
  pagination: ProductPagination;
};

function buildFamilyQuery(
  query: FamilyProductsQuery = {}
) {
  const params =
    new URLSearchParams();

  if (
    query.search?.trim()
  ) {
    params.set(
      "search",
      query.search.trim()
    );
  }

  if (
    query.audience
  ) {
    params.set(
      "audience",
      query.audience
    );
  }

  if (
    query.page !==
    undefined
  ) {
    params.set(
      "page",
      String(
        query.page
      )
    );
  }

  if (
    query.limit !==
    undefined
  ) {
    params.set(
      "limit",
      String(
        query.limit
      )
    );
  }

  const value =
    params.toString();

  return value
    ? `?${value}`
    : "";
}

export const familiesService = {
  getFamilies() {
    return api<FamiliesResponse>(
      "/families"
    );
  },

  getFamily(
    slug: string,
    query: FamilyProductsQuery = {}
  ) {
    return api<FamilyProductsResponse>(
      `/families/${encodeURIComponent(
        slug
      )}${buildFamilyQuery(
        query
      )}`
    );
  },
};
