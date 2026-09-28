import {
  api,
} from "@/lib/api";

export type SearchAudience =
  | "WOMEN"
  | "MEN"
  | "UNISEX";

export type SearchSort =
  | "recommended"
  | "price-low"
  | "price-high"
  | "name";

export type SearchVariant = {
  id: string;
  sku: string;
  size: string;
  price: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  threshold: number;
  active: boolean;
};

export type SearchImage = {
  id: string;
  publicId: string;
  url: string;
  position: number;
};

export type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  family: string;
  concentration: string;
  audience: SearchAudience;
  shortDescription: string | null;
  story: string | null;
  feeling: string | null;
  season: string | null;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  scentMoods: string[];
  scentOccasions: string[];
  scentPersonalities: string[];
  startingPrice: number | null;
  imageUrl: string | null;
  images: SearchImage[];
  variants: SearchVariant[];
  createdAt: string;
};

export type SearchResponse = {
  data: SearchProduct[];
  total: number;

  facets: {
    families: string[];
  };
};

export type SearchProductsParams = {
  q?: string;
  family?: string;
  audience?: SearchAudience;
  sort?: SearchSort;
  limit?: number;
};

export const searchService = {
  search(
    params:
      SearchProductsParams
  ) {
    const searchParams =
      new URLSearchParams();

    const q =
      params.q
        ?.trim();

    if (
      q
    ) {
      searchParams.set(
        "q",
        q
      );
    }

    if (
      params.family &&
      params.family !==
        "All"
    ) {
      searchParams.set(
        "family",
        params.family
      );
    }

    if (
      params.audience
    ) {
      searchParams.set(
        "audience",
        params.audience
      );
    }

    if (
      params.sort
    ) {
      searchParams.set(
        "sort",
        params.sort
      );
    }

    if (
      params.limit
    ) {
      searchParams.set(
        "limit",
        String(
          params.limit
        )
      );
    }

    const query =
      searchParams.toString();

    return api<SearchResponse>(
      `/search${
        query
          ? `?${query}`
          : ""
      }`
    );
  },
};
