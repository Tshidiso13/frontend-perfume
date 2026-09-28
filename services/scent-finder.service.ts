import { api } from "@/lib/api";

import type {
  Product,
} from "@/services/products.service";

export type ScentOccasion =
  | "everyday"
  | "office"
  | "date-night"
  | "special";

export type ScentMood =
  | "fresh"
  | "warm"
  | "dark"
  | "soft";

export type ScentPersonality =
  | "confident"
  | "inviting"
  | "mysterious"
  | "romantic";

export type ScentBudget =
  | "under-1300"
  | "1300-1700"
  | "1700-plus"
  | "any";

export type ScentFinderPayload = {
  occasion?: ScentOccasion;
  mood?: ScentMood;
  personality?: ScentPersonality;
  budget?: ScentBudget;
  limit?: number;
};

export type ScentRecommendation = {
  product: Product;
  score: number;
  reasons: string[];
};

export type ScentFinderResponse = {
  data: ScentRecommendation[];

  meta: {
    totalCandidates: number;
    returned: number;

    answers: {
      occasion: ScentOccasion | null;
      mood: ScentMood | null;
      personality: ScentPersonality | null;
      budget: ScentBudget | null;
    };
  };
};

export const scentFinderService = {
  recommend(
    payload: ScentFinderPayload
  ) {
    return api<ScentFinderResponse>(
      "/scent-finder/recommendations",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );
  },
};
