export const SCENT_OCCASION_OPTIONS = [
  {
    value: "everyday",
    label: "Everyday",
  },
  {
    value: "office",
    label: "The office",
  },
  {
    value: "date-night",
    label: "Date night",
  },
  {
    value: "special",
    label: "Somewhere special",
  },
] as const;

export const SCENT_MOOD_OPTIONS = [
  {
    value: "fresh",
    label: "Fresh & clean",
  },
  {
    value: "warm",
    label: "Warm & seductive",
  },
  {
    value: "dark",
    label: "Dark & mysterious",
  },
  {
    value: "soft",
    label: "Soft & romantic",
  },
] as const;

export const SCENT_PERSONALITY_OPTIONS = [
  {
    value: "confident",
    label: "Quietly confident",
  },
  {
    value: "inviting",
    label: "Warm and inviting",
  },
  {
    value: "mysterious",
    label: "A little mysterious",
  },
  {
    value: "romantic",
    label: "Soft and romantic",
  },
] as const;

export type ScentOccasion =
  (typeof SCENT_OCCASION_OPTIONS)[number]["value"];

export type ScentMood =
  (typeof SCENT_MOOD_OPTIONS)[number]["value"];

export type ScentPersonality =
  (typeof SCENT_PERSONALITY_OPTIONS)[number]["value"];

export type ScentProfileValue = {
  occasions: ScentOccasion[];
  moods: ScentMood[];
  personalities: ScentPersonality[];
};
