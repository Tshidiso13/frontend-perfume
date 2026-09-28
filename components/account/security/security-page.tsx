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
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  securityService,
  type AccountSession,
  type SecurityOverview,
} from "@/services/security.service";

/* =========================================================
   FORMATTERS
========================================================= */

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );

/* =========================================================
   PAGE
========================================================= */

export function SecurityPage() {
  const router =
    useRouter();

  const [
    data,
    setData,
  ] = useState<
    SecurityOverview |
    null
  >(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
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

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrent,
    setShowCurrent,
  ] = useState(
    false
  );

  const [
    showNew,
    setShowNew,
  ] = useState(
    false
  );

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(
    false
  );

  const [
    savingPassword,
    setSavingPassword,
  ] = useState(
    false
  );

  const [
    sessionAction,
    setSessionAction,
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
            await securityService.getOverview();

          setData(
            response
          );
        } catch (
          error
        ) {
          const message =
            getErrorMessage(
              error,
              "Unable to load security settings."
            );

          if (
            /401|unauthori[sz]ed|authentication|sign in|session/i.test(
              message
            )
          ) {
            router.replace(
              "/login?redirect=%2Faccount%2Fsecurity"
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

  const requirements =
    useMemo(
      () => ({
        length:
          newPassword.length >=
          8,

        uppercase:
          /[A-Z]/.test(
            newPassword
          ),

        lowercase:
          /[a-z]/.test(
            newPassword
          ),

        number:
          /\d/.test(
            newPassword
          ),
      }),
      [
        newPassword,
      ]
    );

  const passwordValid =
    Object.values(
      requirements
    ).every(
      Boolean
    );

  const passwordsMatch =
    newPassword.length >
      0 &&
    newPassword ===
      confirmPassword;

  async function changePassword(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !data ||
      savingPassword
    ) {
      return;
    }

    setError(
      null
    );

    setSuccess(
      null
    );

    if (
      data.hasPassword &&
      !currentPassword
    ) {
      setError(
        "Enter your current password."
      );

      return;
    }

    if (
      !passwordValid
    ) {
      setError(
        "Your new password does not meet all requirements."
      );

      return;
    }

    if (
      !passwordsMatch
    ) {
      setError(
        "New passwords do not match."
      );

      return;
    }

    setSavingPassword(
      true
    );

    try {
      const response =
        await securityService.changePassword(
          {
            ...(data.hasPassword
              ? {
                  currentPassword,
                }
              : {}),

            newPassword,
          }
        );

      setSuccess(
        response.message
      );

      /*
       * Backend revokes every session and clears auth cookies.
       */
      window.setTimeout(
        () => {
          router.replace(
            "/login?passwordChanged=1"
          );

          router.refresh();
        },
        900
      );
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to update your password."
        )
      );
    } finally {
      setSavingPassword(
        false
      );
    }
  }

  async function revokeSession(
    session:
      AccountSession
  ) {
    if (
      sessionAction
    ) {
      return;
    }

    setSessionAction(
      session.id
    );

    setError(
      null
    );

    try {
      const result =
        await securityService.revokeSession(
          session.id
        );

      if (
        result.isCurrent
      ) {
        router.replace(
          "/login?sessionRevoked=1"
        );

        router.refresh();

        return;
      }

      await load();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to revoke this session."
        )
      );
    } finally {
      setSessionAction(
        null
      );
    }
  }

  async function revokeOthers() {
    if (
      sessionAction
    ) {
      return;
    }

    setSessionAction(
      "others"
    );

    setError(
      null
    );

    try {
      const result =
        await securityService.revokeOtherSessions();

      setSuccess(
        result.revoked ===
        1
          ? "1 other session was signed out."
          : `${result.revoked} other sessions were signed out.`
      );

      await load();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to sign out other sessions."
        )
      );
    } finally {
      setSessionAction(
        null
      );
    }
  }

  async function revokeAll() {
    if (
      sessionAction
    ) {
      return;
    }

    setSessionAction(
      "all"
    );

    setError(
      null
    );

    try {
      await securityService.revokeAllSessions();

      router.replace(
        "/login?signedOutEverywhere=1"
      );

      router.refresh();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to sign out all sessions."
        )
      );

      setSessionAction(
        null
      );
    }
  }

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[650px] items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-5 animate-spin !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />

          <p className="mt-4 text-[9px] !text-[#8a7871]">
            Loading security settings...
          </p>
        </div>
      </section>
    );
  }

  if (
    !data
  ) {
    return (
      <section className="flex min-h-[650px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="max-w-md text-center">
          <CircleAlert
            className="mx-auto size-6 !text-[#9a756c]"
            strokeWidth={
              1.3
            }
          />

          <h1 className="mt-5 font-display text-[38px] !text-[#382724]">
            Security unavailable.
          </h1>

          <p className="mt-3 text-[10px] leading-5 !text-[#88766f]">
            {
              error ??
              "We could not load your security settings."
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
            Password & security
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-9 border-b border-[#ded6cf] pb-9">
          <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
            Account protection
          </p>

          <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px]">
            Password & security.
          </h1>

          <p className="mt-4 max-w-2xl text-[10px] leading-6 !text-[#85746e]">
            Manage your password, connected sign-in method and active ÉLAN sessions.
          </p>
        </div>

        {/* MESSAGES */}

        {(error ||
          success) && (
          <div
            className={`mt-6 flex items-start gap-3 border px-4 py-4 ${
              error
                ? "border-[#ead7d2] bg-[#faf1ee]"
                : "border-[#d7e3d9] bg-[#f2f6f2]"
            }`}
          >
            {error ? (
              <CircleAlert
                className="mt-0.5 size-4 shrink-0 !text-[#995c50]"
                strokeWidth={
                  1.35
                }
              />
            ) : (
              <BadgeCheck
                className="mt-0.5 size-4 shrink-0 !text-[#55705b]"
                strokeWidth={
                  1.35
                }
              />
            )}

            <p
              className={`text-[9px] leading-5 ${
                error
                  ? "!text-[#80574e]"
                  : "!text-[#55705b]"
              }`}
            >
              {
                error ??
                success
              }
            </p>
          </div>
        )}

        {/* SECURITY SUMMARY */}

        <div className="mt-8 grid gap-px border border-[#ded6cf] bg-[#ded6cf] sm:grid-cols-2 lg:grid-cols-4">
          <SecurityStat
            icon={
              LockKeyhole
            }
            label="Password"
            value={
              data.hasPassword
                ? "Active"
                : "Not set"
            }
          />

          <SecurityStat
            icon={
              ShieldCheck
            }
            label="Email"
            value={
              data.emailVerified
                ? "Verified"
                : "Not verified"
            }
          />

          <SecurityStat
            icon={
              KeyRound
            }
            label="Google"
            value={
              data.googleConnected
                ? "Connected"
                : "Not connected"
            }
          />

          <SecurityStat
            icon={
              Laptop
            }
            label="Sessions"
            value={
              String(
                data.activeSessionCount
              )
            }
          />
        </div>

        {/* PASSWORD */}

        <form
          onSubmit={
            changePassword
          }
          className="mt-10 border border-[#e5ddd3]"
        >
          <div className="border-b border-[#e5ddd3] p-6 sm:p-8">
            <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
              Password
            </p>

            <h2 className="mt-3 font-display text-[30px] !text-[#382724]">
              {
                data.hasPassword
                  ? "Change your password."
                  : "Create a password."
              }
            </h2>

            <p className="mt-3 max-w-2xl text-[9px] leading-5 !text-[#88766f]">
              {
                data.hasPassword
                  ? "After a password change, every active session is signed out for your protection."
                  : "Your account currently relies on another sign-in method. Add a password if you also want to sign in with email and password."
              }
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {data.hasPassword && (
              <PasswordField
                label="Current password"
                value={
                  currentPassword
                }
                show={
                  showCurrent
                }
                onShow={() =>
                  setShowCurrent(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                onChange={
                  setCurrentPassword
                }
                autoComplete="current-password"
              />
            )}

            <PasswordField
              label="New password"
              value={
                newPassword
              }
              show={
                showNew
              }
              onShow={() =>
                setShowNew(
                  (
                    value
                  ) =>
                    !value
                )
              }
              onChange={
                setNewPassword
              }
              autoComplete="new-password"
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <Requirement
                met={
                  requirements.length
                }
                text="At least 8 characters"
              />

              <Requirement
                met={
                  requirements.uppercase
                }
                text="One uppercase letter"
              />

              <Requirement
                met={
                  requirements.lowercase
                }
                text="One lowercase letter"
              />

              <Requirement
                met={
                  requirements.number
                }
                text="One number"
              />
            </div>

            <PasswordField
              label="Confirm new password"
              value={
                confirmPassword
              }
              show={
                showConfirm
              }
              onShow={() =>
                setShowConfirm(
                  (
                    value
                  ) =>
                    !value
                )
              }
              onChange={
                setConfirmPassword
              }
              autoComplete="new-password"
            />

            {confirmPassword &&
              !passwordsMatch && (
              <p className="text-[8px] !text-[#98594f]">
                Passwords do not match.
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-[#e5ddd3] p-6 sm:p-8">
            <button
              type="submit"
              disabled={
                savingPassword ||
                !passwordValid ||
                !passwordsMatch ||
                (
                  data.hasPassword &&
                  !currentPassword
                )
              }
              className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#541627] px-6 text-[9px] font-medium !text-white transition hover:bg-[#6b2230] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {savingPassword ? (
                <LoaderCircle
                  className="size-3.5 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <KeyRound
                  className="size-3.5"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              {
                data.hasPassword
                  ? "Change password"
                  : "Create password"
              }
            </button>
          </div>
        </form>

        {/* SESSIONS */}

        <section className="mt-4 border border-[#e5ddd3]">
          <div className="flex flex-col gap-5 border-b border-[#e5ddd3] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
                Devices & sessions
              </p>

              <h2 className="mt-3 font-display text-[30px] !text-[#382724]">
                Where you’re signed in.
              </h2>

              <p className="mt-3 max-w-xl text-[9px] leading-5 !text-[#88766f]">
                Remove a session you do not recognise. Revoked sessions cannot refresh their authentication.
              </p>
            </div>

            {data.sessions.length >
              1 && (
              <button
                type="button"
                disabled={
                  Boolean(
                    sessionAction
                  )
                }
                onClick={() =>
                  void revokeOthers()
                }
                className="w-fit border-b border-[#6b2230] pb-1 text-[8px] font-medium !text-[#6b2230] disabled:opacity-40"
              >
                Sign out other sessions
              </button>
            )}
          </div>

          {data.sessions.length >
            0 ? (
            <div className="divide-y divide-[#e5ddd3]">
              {data.sessions.map(
                (
                  session
                ) => (
                  <SessionRow
                    key={
                      session.id
                    }
                    session={
                      session
                    }
                    loading={
                      sessionAction ===
                      session.id
                    }
                    onRevoke={() =>
                      void revokeSession(
                        session
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Laptop
                className="mx-auto size-5 !text-[#9d8981]"
                strokeWidth={
                  1.3
                }
              />

              <p className="mt-4 text-[9px] !text-[#88766f]">
                No active refresh sessions were found.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-[#e5ddd3] bg-[#f8f4f0] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[9px] font-medium !text-[#4d3934]">
                Sign out everywhere
              </p>

              <p className="mt-1 text-[8px] leading-4 !text-[#8d7a73]">
                Revokes every active session, including this one.
              </p>
            </div>

            <button
              type="button"
              disabled={
                Boolean(
                  sessionAction
                )
              }
              onClick={() =>
                void revokeAll()
              }
              className="inline-flex min-h-[42px] w-fit items-center gap-2 border border-[#8d4c4c] px-4 text-[8px] font-medium !text-[#8d4c4c] disabled:opacity-40"
            >
              {sessionAction ===
              "all" ? (
                <LoaderCircle
                  className="size-3.5 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <LogOut
                  className="size-3.5"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              Sign out everywhere
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  label,
  value,
  show,
  onShow,
  onChange,
  autoComplete,
}: {
  label:
    string;

  value:
    string;

  show:
    boolean;

  onShow:
    () =>
      void;

  onChange:
    (
      value:
        string
    ) =>
      void;

  autoComplete:
    string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.16em] !text-[#806b64]">
        {
          label
        }
      </label>

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={
            value
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={
            autoComplete
          }
          className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 pr-12 text-[10px] !text-[#382724] outline-none transition focus:border-[#6b2230]"
        />

        <button
          type="button"
          onClick={
            onShow
          }
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-0 top-0 flex size-12 items-center justify-center !text-[#8a7770]"
        >
          {show ? (
            <EyeOff
              className="size-4"
              strokeWidth={
                1.35
              }
            />
          ) : (
            <Eye
              className="size-4"
              strokeWidth={
                1.35
              }
            />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({
  met,
  text,
}: {
  met:
    boolean;

  text:
    string;
}) {
  return (
    <div className="flex items-center gap-2 text-[8px]">
      <span
        className={`size-1.5 rounded-full ${
          met
            ? "bg-[#58705d]"
            : "bg-[#c9bbb4]"
        }`}
      />

      <span
        className={
          met
            ? "!text-[#58705d]"
            : "!text-[#9a8881]"
        }
      >
        {
          text
        }
      </span>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function SecurityStat({
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
    <div className="bg-[#fbfaf7] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-[8px] uppercase tracking-[0.17em] !text-[#90766e]">
          {
            label
          }
        </p>

        <Icon
          className="size-4 !text-[#8b6960]"
          strokeWidth={
            1.3
          }
        />
      </div>

      <p className="mt-5 font-display text-[25px] !text-[#342725]">
        {
          value
        }
      </p>
    </div>
  );
}

/* =========================================================
   SESSION
========================================================= */

function SessionRow({
  session,
  loading,
  onRevoke,
}: {
  session:
    AccountSession;

  loading:
    boolean;

  onRevoke:
    () =>
      void;
}) {
  const mobile =
    isMobileUserAgent(
      session.userAgent
    );

  const Icon =
    mobile
      ? Smartphone
      : Laptop;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-[40px_1fr_auto] sm:items-center sm:p-7">
      <div className="flex size-10 items-center justify-center border border-[#ded5cf] bg-[#f3eee8]">
        <Icon
          className="size-4 !text-[#7e6259]"
          strokeWidth={
            1.35
          }
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-medium !text-[#473630]">
            {
              describeDevice(
                session.userAgent
              )
            }
          </p>

          {session.isCurrent && (
            <span className="bg-[#e9efe9] px-2 py-1 text-[7px] font-medium uppercase tracking-[0.08em] !text-[#56705d]">
              This device
            </span>
          )}
        </div>

        <p className="mt-2 break-words text-[8px] leading-4 !text-[#95827a]">
          {session.ipAddress
            ? `${session.ipAddress} · `
            : ""}

          Signed in{" "}
          {
            formatDate(
              session.createdAt
            )
          }

          {" · "}
          expires{" "}
          {
            formatDate(
              session.expiresAt
            )
          }
        </p>
      </div>

      <button
        type="button"
        disabled={
          loading
        }
        onClick={
          onRevoke
        }
        className="inline-flex min-h-[38px] w-fit items-center gap-2 border border-[#dacfc8] px-3 text-[8px] !text-[#765f58] disabled:opacity-40"
      >
        {loading ? (
          <LoaderCircle
            className="size-3 animate-spin"
            strokeWidth={
              1.4
            }
          />
        ) : (
          <LogOut
            className="size-3"
            strokeWidth={
              1.4
            }
          />
        )}

        {
          session.isCurrent
            ? "Sign out"
            : "Revoke"
        }
      </button>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

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

  return dateTimeFormatter.format(
    parsed
  );
}

function isMobileUserAgent(
  userAgent:
    string |
    null
) {
  return /android|iphone|ipad|mobile/i.test(
    userAgent ??
    ""
  );
}

function describeDevice(
  userAgent:
    string |
    null
) {
  if (
    !userAgent
  ) {
    return "Unknown device";
  }

  const browser =
    /edg\//i.test(
      userAgent
    )
      ? "Edge"
      : /chrome\//i.test(
          userAgent
        )
      ? "Chrome"
      : /firefox\//i.test(
          userAgent
        )
      ? "Firefox"
      : /safari\//i.test(
          userAgent
        )
      ? "Safari"
      : "Browser";

  const system =
    /windows/i.test(
      userAgent
    )
      ? "Windows"
      : /iphone|ipad/i.test(
          userAgent
        )
      ? "iOS"
      : /android/i.test(
          userAgent
        )
      ? "Android"
      : /mac os|macintosh/i.test(
          userAgent
        )
      ? "macOS"
      : /linux/i.test(
          userAgent
        )
      ? "Linux"
      : "device";

  return `${browser} · ${system}`;
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
