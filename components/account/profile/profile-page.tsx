"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  LoaderCircle,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  profileService,
  type AccountProfile,
} from "@/services/profile.service";

/* =========================================================
   FORMATTERS
========================================================= */

const dateFormatter =
  new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",
    }
  );

/* =========================================================
   PAGE
========================================================= */

export function ProfilePage() {
  const router =
    useRouter();

  const [
    profile,
    setProfile,
  ] = useState<
    AccountProfile |
    null
  >(
    null
  );

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    saving,
    setSaving,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState<
    string |
    null
  >(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<
    string |
    null
  >(
    null
  );

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await profileService.getProfile();

          setProfile(
            response
          );

          setName(
            response.name ??
            ""
          );

          setEmail(
            response.email ??
            ""
          );
        } catch (
          error
        ) {
          const message =
            getErrorMessage(
              error,
              "Unable to load your profile."
            );

          if (
            isUnauthorized(
              message
            )
          ) {
            router.replace(
              "/login?redirect=%2Faccount%2Fprofile"
            );

            return;
          }

          setError(
            message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        router,
      ]
    );

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ]
  );

  const initials =
    useMemo(
      () =>
        getInitials(
          profile?.name ??
          name
        ),
      [
        name,
        profile?.name,
      ]
    );

  const dirty =
    Boolean(
      profile &&
      (
        name.trim() !==
          profile.name.trim() ||
        email
          .trim()
          .toLowerCase() !==
          profile.email
            .trim()
            .toLowerCase()
      )
    );

  function resetForm() {
    if (
      !profile
    ) {
      return;
    }

    setName(
      profile.name
    );

    setEmail(
      profile.email
    );

    setError(
      null
    );

    setSuccess(
      null
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !profile ||
      saving
    ) {
      return;
    }

    const cleanName =
      name
        .trim()
        .replace(
          /\s+/g,
          " "
        );

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (
      cleanName.length <
      2
    ) {
      setError(
        "Your name must be at least 2 characters."
      );

      return;
    }

    if (
      !isEmail(
        cleanEmail
      )
    ) {
      setError(
        "Enter a valid email address."
      );

      return;
    }

    if (
      !dirty
    ) {
      setSuccess(
        "Your profile is already up to date."
      );

      return;
    }

    setSaving(
      true
    );

    setError(
      null
    );

    setSuccess(
      null
    );

    try {
      const updated =
        await profileService.updateProfile(
          {
            name:
              cleanName,

            email:
              cleanEmail,
          }
        );

      setProfile(
        updated
      );

      setName(
        updated.name
      );

      setEmail(
        updated.email
      );

      setSuccess(
        "Your profile has been updated."
      );

      router.refresh();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to update your profile."
        )
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-5 animate-spin !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />

          <p className="mt-4 text-[9px] !text-[#8d7a73]">
            Loading your profile...
          </p>
        </div>
      </section>
    );
  }

  if (
    !profile
  ) {
    return (
      <section className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="max-w-md text-center">
          <CircleAlert
            className="mx-auto size-6 !text-[#9a756c]"
            strokeWidth={
              1.3
            }
          />

          <h1 className="mt-5 font-display text-[38px] !text-[#382724]">
            Profile unavailable.
          </h1>

          <p className="mt-3 text-[10px] leading-5 !text-[#88766f]">
            {
              error ??
              "We could not load your profile."
            }
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="mt-6 inline-flex items-center gap-2 border-b border-[#6b2230] pb-1 text-[9px] !text-[#6b2230]"
          >
            <RefreshCcw
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />

            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1120px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-14">
        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] !text-[#98877f]">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 transition-colors hover:!text-[#5a1425]"
          >
            <ArrowLeft
              className="size-3"
              strokeWidth={
                1.4
              }
            />

            Account
          </Link>

          <span>
            /
          </span>

          <span>
            Profile
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-9 border-b border-[#ded6cf] pb-9">
          <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
            Personal details
          </p>

          <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px]">
            Your profile.
          </h1>

          <p className="mt-4 max-w-xl text-[10px] leading-6 !text-[#85746e]">
            Keep the personal details connected to your ÉLAN account accurate and up to date.
          </p>
        </div>

        {/* PROFILE SUMMARY */}

        <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="border border-[#e5ddd3] p-6 sm:p-7">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-[#ddd2ca] bg-[#f3ece7]">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    profile.image
                  }
                  alt={
                    profile.name
                  }
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-display text-[29px] !text-[#6b2230]">
                  {
                    initials
                  }
                </span>
              )}
            </div>

            <h2 className="mt-5 font-display text-[28px] !text-[#382724]">
              {
                profile.name
              }
            </h2>

            <p className="mt-2 break-all text-[9px] !text-[#88766f]">
              {
                profile.email
              }
            </p>

            <div className="mt-7 space-y-4 border-t border-[#e5ddd3] pt-6">
              <SummaryRow
                icon={
                  ShieldCheck
                }
                label="Account type"
                value={
                  formatEnum(
                    profile.role
                  )
                }
              />

              <SummaryRow
                icon={
                  BadgeCheck
                }
                label="Email"
                value={
                  profile.emailVerified
                    ? "Verified"
                    : "Not verified"
                }
              />

              <SummaryRow
                icon={
                  CalendarDays
                }
                label="Member since"
                value={
                  formatDate(
                    profile.createdAt
                  )
                }
              />
            </div>
          </aside>

          {/* FORM */}

          <form
            onSubmit={
              submit
            }
            className="border border-[#e5ddd3]"
          >
            <div className="border-b border-[#e5ddd3] p-6 sm:p-8">
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
                Profile information
              </p>

              <h2 className="mt-3 font-display text-[30px] !text-[#382724]">
                Personal information.
              </h2>

              <p className="mt-3 max-w-lg text-[9px] leading-5 !text-[#88766f]">
                This information identifies your account and is used when we communicate with you.
              </p>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {error && (
                <Message
                  tone="error"
                  text={
                    error
                  }
                />
              )}

              {success && (
                <Message
                  tone="success"
                  text={
                    success
                  }
                />
              )}

              <Field
                label="Full name"
                icon={
                  UserRound
                }
              >
                <input
                  type="text"
                  autoComplete="name"
                  value={
                    name
                  }
                  onChange={(
                    event
                  ) => {
                    setName(
                      event.target.value
                    );

                    setSuccess(
                      null
                    );
                  }}
                  maxLength={
                    80
                  }
                  className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 text-[10px] !text-[#382724] outline-none transition focus:border-[#6b2230]"
                />
              </Field>

              <Field
                label="Email address"
                icon={
                  Mail
                }
              >
                <input
                  type="email"
                  autoComplete="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) => {
                    setEmail(
                      event.target.value
                    );

                    setSuccess(
                      null
                    );
                  }}
                  maxLength={
                    254
                  }
                  className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 text-[10px] !text-[#382724] outline-none transition focus:border-[#6b2230]"
                />

                <p className="mt-2 text-[8px] leading-4 !text-[#9b8982]">
                  Order updates and important account communication are sent to this address.
                </p>
              </Field>

              <div className="border-t border-[#e5ddd3] pt-6">
                <p className="text-[8px] uppercase tracking-[0.16em] !text-[#9a756c]">
                  Security
                </p>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-lg text-[9px] leading-5 !text-[#88766f]">
                    Password changes and sign-in security are managed separately from your personal profile.
                  </p>

                  <Link
                    href="/account/security"
                    className="w-fit border-b border-[#6b2230] pb-1 text-[8px] font-medium !text-[#6b2230]"
                  >
                    Manage security
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#e5ddd3] p-6 sm:flex-row sm:items-center sm:justify-end sm:p-8">
              <button
                type="button"
                disabled={
                  !dirty ||
                  saving
                }
                onClick={
                  resetForm
                }
                className="min-h-[44px] border border-[#d9cec8] px-5 text-[9px] !text-[#6f5e58] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Discard changes
              </button>

              <button
                type="submit"
                disabled={
                  !dirty ||
                  saving
                }
                className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#541627] px-6 text-[9px] font-medium !text-white transition hover:bg-[#6b2230] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    strokeWidth={
                      1.4
                    }
                  />
                ) : (
                  <Save
                    className="size-3.5"
                    strokeWidth={
                      1.4
                    }
                  />
                )}

                {
                  saving
                    ? "Saving..."
                    : "Save changes"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  icon:
    Icon,

  children,
}: {
  label:
    string;

  icon:
    React.ElementType;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.16em] !text-[#806b64]">
        <Icon
          className="size-3.5"
          strokeWidth={
            1.35
          }
        />

        {
          label
        }
      </label>

      {
        children
      }
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryRow({
  icon:
    Icon,

  label,
  value,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 size-3.5 shrink-0 !text-[#8b6960]"
        strokeWidth={
          1.35
        }
      />

      <div>
        <p className="text-[7px] uppercase tracking-[0.14em] !text-[#9e8d86]">
          {
            label
          }
        </p>

        <p className="mt-1 text-[9px] !text-[#4b3934]">
          {
            value
          }
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MESSAGE
========================================================= */

function Message({
  tone,
  text,
}: {
  tone:
    "error" |
    "success";

  text:
    string;
}) {
  const success =
    tone ===
    "success";

  return (
    <div
      className={`flex items-start gap-3 border px-4 py-3 ${
        success
          ? "border-[#d6e2d8] bg-[#f1f6f2]"
          : "border-[#ead7d2] bg-[#faf1ee]"
      }`}
    >
      {success ? (
        <BadgeCheck
          className="mt-0.5 size-4 shrink-0 !text-[#55705b]"
          strokeWidth={
            1.35
          }
        />
      ) : (
        <CircleAlert
          className="mt-0.5 size-4 shrink-0 !text-[#995c50]"
          strokeWidth={
            1.35
          }
        />
      )}

      <p
        className={`text-[9px] leading-5 ${
          success
            ? "!text-[#55705b]"
            : "!text-[#80574e]"
        }`}
      >
        {
          text
        }
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name:
    string
) {
  const parts =
    name
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      )
      .slice(
        0,
        2
      );

  if (
    parts.length ===
    0
  ) {
    return "É";
  }

  return parts
    .map(
      (
        part
      ) =>
        part[0]
          ?.toUpperCase() ??
        ""
    )
    .join("");
}

function isEmail(
  value:
    string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isUnauthorized(
  value:
    string
) {
  return /401|unauthori[sz]ed|authentication|sign in|session/i.test(
    value
  );
}

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {
  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  if (
    typeof error ===
      "object" &&
    error !==
      null
  ) {
    const candidate =
      error as {
        message?:
          unknown;
      };

    if (
      typeof candidate.message ===
      "string"
    ) {
      return candidate.message;
    }
  }

  return fallback;
}

function formatDate(
  value:
    string
) {
  const parsed =
    new Date(
      value
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return dateFormatter.format(
    parsed
  );
}

function formatEnum(
  value:
    string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}
