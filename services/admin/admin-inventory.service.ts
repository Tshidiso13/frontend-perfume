import {
  api,
} from "@/lib/api";

export type InventoryItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  family: string;
  productStatus: string;

  size: string;
  sku: string;

  stock: number;
  reservedStock: number;
  availableStock: number;
  threshold: number;

  active: boolean;
  price: number;
  imageUrl: string | null;
};

export type InventoryStats = {
  totalVariants: number;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type InventoryResponse = {
  data: InventoryItem[];
  stats: InventoryStats;
};

export type UpdateInventoryStockPayload = {
  stock: number;
  threshold?: number;
};

export const inventoryService = {
  getInventory() {
    return api<InventoryResponse>(
      "/admin/inventory"
    );
  },

  updateStock(
    variantId: string,
    payload: UpdateInventoryStockPayload
  ) {
    return api<{
      message: string;
      item: InventoryItem;
    }>(
      `/admin/inventory/${variantId}`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            payload
          ),
      }
    );
  },
};
