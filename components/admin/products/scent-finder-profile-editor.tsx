"use client";

import {
  Check,
} from "lucide-react";

import {
  SCENT_MOOD_OPTIONS,
  SCENT_OCCASION_OPTIONS,
  SCENT_PERSONALITY_OPTIONS,
  type ScentMood,
  type ScentOccasion,
  type ScentPersonality,
  type ScentProfileValue,
} from "@/lib/scent-finder-options";

type Props = {
  value: ScentProfileValue;

  onChange: (
    value: ScentProfileValue
  ) => void;

  disabled?: boolean;
};

export function ScentFinderProfileEditor({
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-7">
      <OptionGroup
        title="Occasions"
        description="Where should this fragrance be recommended?"
        options={
          SCENT_OCCASION_OPTIONS
        }
        selected={
          value.occasions
        }
        disabled={
          disabled
        }
        onToggle={(
          option
        ) =>
          onChange({
            ...value,
            occasions:
              toggleValue(
                value.occasions,
                option
              ),
          })
        }
      />

      <OptionGroup
        title="Mood"
        description="What kind of feeling does this fragrance fit?"
        options={
          SCENT_MOOD_OPTIONS
        }
        selected={
          value.moods
        }
        disabled={
          disabled
        }
        onToggle={(
          option
        ) =>
          onChange({
            ...value,
            moods:
              toggleValue(
                value.moods,
                option
              ),
          })
        }
      />

      <OptionGroup
        title="Personality"
        description="How should the wearer want to be remembered?"
        options={
          SCENT_PERSONALITY_OPTIONS
        }
        selected={
          value.personalities
        }
        disabled={
          disabled
        }
        onToggle={(
          option
        ) =>
          onChange({
            ...value,
            personalities:
              toggleValue(
                value.personalities,
                option
              ),
          })
        }
      />

      <p className="border-t border-[#e5ddd3] pt-4 text-[8px] leading-5 !text-[#96847d]">
        These selections are used by
        the Scent Finder backend as
        strict recommendation filters.
        Select every option that truly
        fits this fragrance.
      </p>
    </div>
  );
}

function OptionGroup<
  T extends string,
>({
  title,
  description,
  options,
  selected,
  disabled,
  onToggle,
}: {
  title: string;
  description: string;

  options: readonly {
    value: T;
    label: string;
  }[];

  selected: T[];

  disabled?: boolean;

  onToggle: (
    value: T
  ) => void;
}) {
  return (
    <div>
      <div>
        <h3 className="font-display text-[21px] !text-[#3b2b28]">
          {title}
        </h3>

        <p className="mt-1.5 text-[8px] leading-5 !text-[#96847d]">
          {description}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map(
          (option) => {
            const active =
              selected.includes(
                option.value
              );

            return (
              <button
                key={
                  option.value
                }
                type="button"
                disabled={
                  disabled
                }
                aria-pressed={
                  active
                }
                onClick={() =>
                  onToggle(
                    option.value
                  )
                }
                className={`
                  flex
                  min-h-[48px]
                  items-center
                  justify-between
                  border
                  px-4
                  text-left
                  text-[9px]
                  font-medium
                  transition-colors
                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  ${
                    active
                      ? "border-[#6b2230] bg-[#6b2230] !text-white"
                      : "border-[#ddd4ce] bg-[#f7f3ee] !text-[#4d3b36] hover:border-[#a8847b]"
                  }
                `}
              >
                <span>
                  {
                    option.label
                  }
                </span>

                <span
                  className={`
                    flex
                    size-5
                    items-center
                    justify-center
                    rounded-full
                    border

                    ${
                      active
                        ? "border-white/35 bg-white/10"
                        : "border-[#c9bbb4]"
                    }
                  `}
                >
                  {active && (
                    <Check
                      className="size-3"
                      strokeWidth={
                        2
                      }
                    />
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function toggleValue<
  T extends string,
>(
  values: T[],
  value: T
) {
  return values.includes(
    value
  )
    ? values.filter(
        (item) =>
          item !== value
      )
    : [
        ...values,
        value,
      ];
}
