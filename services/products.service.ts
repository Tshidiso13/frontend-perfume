import { api } from "@/lib/api";
import type {
  ScentMood,
  ScentOccasion,
  ScentPersonality,
} from "@/lib/scent-finder-options";

export type ProductAudience =
  | "WOMEN"
  | "MEN"
  | "UNISEX";

export type ProductStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED";

export type CreateProductAudience =
  | "Women"
  | "Men"
  | "Unisex";

export type CreateProductStatus =
  | "Draft"
  | "Active";

export type ProductVariant = {
  id: string;
  size: string;
  sku: string;
  price: number;
  stock: number;
  reservedStock: number;
  threshold: number;
  active: boolean;
};

export type Product = {
  id: string;

  name: string;
  slug: string;

  shortDescription: string;
  story: string | null;

  family: string;
  concentration: string;

  audience: ProductAudience;

  badge: string | null;
  status: ProductStatus;

  images: ProductImage[];

  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];

  feeling: string | null;
  longevity: string | null;
  sillage: string | null;
  season: string | null;

  seoTitle: string | null;
  seoDescription: string | null;

  scentOccasions: ScentOccasion[];
  scentMoods: ScentMood[];
  scentPersonalities: ScentPersonality[];

  variants: ProductVariant[];

  totalStock: number;
  totalReservedStock?: number;
  availableStock?: number;

  startingPrice: number | null;

  createdAt: string;
  updatedAt: string;
};

export type ProductNotesPayload = {
  top: string[];
  heart: string[];
  base: string[];
};

export type CreateProductVariantPayload = {
  id?: string;

  size: string;
  price: string;
  stock: string;

  sku?: string;
};

export type CreateProductPayload = {
  name: string;
  slug: string;

  shortDescription: string;
  story?: string;

  family: string;
  concentration: string;

  audience: CreateProductAudience;

  scentOccasions: ScentOccasion[];
  scentMoods: ScentMood[];
  scentPersonalities: ScentPersonality[];

  badge?: string;

  status: CreateProductStatus;

  feeling?: string;
  longevity?: string;
  sillage?: string;
  season?: string;

  seoTitle?: string;
  seoDescription?: string;

  images?: {
    publicId: string;
    url: string;
  }[];

  notes: ProductNotesPayload;

  variants: CreateProductVariantPayload[];
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type UploadedProductImage = {
  fileId: string;

  publicId: string;

  name: string;

  filePath: string;

  url: string;

  thumbnailUrl?:
  | string
  | null;

  width?:
  | number
  | null;

  height?:
  | number
  | null;

  size?:
  | number
  | null;
};

export type AdminProductsResponse = {
  data: Product[];
  pagination: ProductPagination;
};


export type ProductImage = {
  id: string;

  productId: string;

  publicId: string;
  url: string;

  position: number;

  createdAt: string;
  updatedAt: string;
};

export type AdminProductQuery = {
  search?: string;
  family?: string;

  status?:
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED";

  audience?:
  | "WOMEN"
  | "MEN"
  | "UNISEX";

  page?: number;
  limit?: number;
};

export type PublicProductQuery = {
  search?: string;

  family?: string;

  audience?:
    | "WOMEN"
    | "MEN"
    | "UNISEX";

  mood?:
    | "fresh"
    | "warm"
    | "dark"
    | "soft";

  page?: number;

  limit?: number;
};

function buildPublicProductQuery(
  query: PublicProductQuery = {}
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
    query.family?.trim()
  ) {
    params.set(
      "family",
      query.family.trim()
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
    query.mood
  ) {
    params.set(
      "mood",
      query.mood
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

  const search =
    params.toString();

  return search
    ? `?${search}`
    : "";
}

function buildQuery(
  query: AdminProductQuery = {}
) {
  const params =
    new URLSearchParams();

  if (query.search?.trim()) {
    params.set(
      "search",
      query.search.trim()
    );
  }

  if (query.family?.trim()) {
    params.set(
      "family",
      query.family.trim()
    );
  }

  if (query.status) {
    params.set(
      "status",
      query.status
    );
  }

  if (query.audience) {
    params.set(
      "audience",
      query.audience
    );
  }

  if (query.page) {
    params.set(
      "page",
      String(query.page)
    );
  }

  if (query.limit) {
    params.set(
      "limit",
      String(query.limit)
    );
  }

  const value =
    params.toString();

  return value
    ? `?${value}`
    : "";
}

export const productsService = {
  create(
    payload: CreateProductPayload
  ) {
    return api<Product>(
      "/admin/products",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );
  },

  getAdminProducts(
    query: AdminProductQuery = {}
  ) {
    return api<AdminProductsResponse>(
      `/admin/products${buildQuery(
        query
      )}`
    );
  },

  addProductImage(
    productId: string,
    image: {
      publicId: string;
      url: string;
    }
  ) {
    return api<ProductImage>(
      `/admin/products/${productId}/images`,
      {
        method: "POST",

        body:
          JSON.stringify(
            image
          ),
      }
    );
  },

  deleteProductImage(
    productId: string,
    imageId: string
  ) {
    return api<{
      message: string;
    }>(
      `/admin/products/${productId}/images/${imageId}`,
      {
        method: "DELETE",
      }
    );
  },

  uploadImage(
    file: File
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    return api<UploadedProductImage>(
      "/admin/products/images",
      {
        method: "POST",

        body: formData,
      }
    );
  },

  deleteImage(
    publicId: string
  ) {
    return api<{
      message: string;
      result: string;
    }>(
      "/admin/products/images",
      {
        method: "DELETE",

        body:
          JSON.stringify({
            publicId,
          }),
      }
    );
  },
  getAdminProduct(
    productId: string
  ) {
    return api<Product>(
      `/admin/products/${productId}`
    );
  },

  update(
    productId: string,
    payload: Partial<CreateProductPayload>
  ) {
    return api<Product>(
      `/admin/products/${productId}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          payload
        ),
      }
    );
  },

  archive(
    productId: string
  ) {
    return api<{
      message: string;
    }>(
      `/admin/products/${productId}`,
      {
        method: "DELETE",
      }
    );
  },

  getPublicProducts(
    query: PublicProductQuery = {}
  ) {
    return api<{
      data: Product[];
      pagination:
      ProductPagination;
    }>(
      `/products${buildPublicProductQuery(
        query
      )}`
    );
  },

  getPublicProduct(
    slug: string
  ) {
    return api<Product>(
      `/products/${slug}`
    );
  },
};