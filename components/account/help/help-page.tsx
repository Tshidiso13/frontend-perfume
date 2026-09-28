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
  Clock3,
  CreditCard,
  HelpCircle,
  LoaderCircle,
  MessageCircle,
  Package,
  RefreshCcw,
  RotateCcw,
  Send,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  supportService,
  type SupportCategory,
  type SupportTicket,
} from "@/services/support.service";

/* =========================================================
   PAGE
========================================================= */

export function HelpPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    tickets,
    setTickets,
  ] = useState<
    SupportTicket[]
  >([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState<
    string |
    null
  >(
    searchParams.get(
      "ticket"
    )
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
    creating,
    setCreating,
  ] = useState(
    false
  );

  const [
    replying,
    setReplying,
  ] = useState(
    false
  );

  const [
    category,
    setCategory,
  ] = useState<
    SupportCategory
  >(
    "ORDER"
  );

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    orderNumber,
    setOrderNumber,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    reply,
    setReply,
  ] = useState("");

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
            await supportService.getMine();

          setTickets(
            response
          );

          setSelectedId(
            (
              current
            ) =>
              current ??
              response[0]?.id ??
              null
          );
        } catch (
          error
        ) {
          const text =
            getErrorMessage(
              error,
              "Unable to load customer care."
            );

          if (
            /401|unauthori[sz]ed|authentication|sign in|session/i.test(
              text
            )
          ) {
            router.replace(
              "/login?redirect=%2Faccount%2Fhelp"
            );

            return;
          }

          setError(
            text
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

  const selected =
    useMemo(
      () =>
        tickets.find(
          (
            ticket
          ) =>
            ticket.id ===
            selectedId
        ) ??
        null,
      [
        selectedId,
        tickets,
      ]
    );

  async function createTicket(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      creating
    ) {
      return;
    }

    if (
      subject.trim().length <
      4
    ) {
      setError(
        "Tell us briefly what you need help with."
      );

      return;
    }

    if (
      message.trim().length <
      10
    ) {
      setError(
        "Please give us a little more detail so we can help properly."
      );

      return;
    }

    setCreating(
      true
    );

    setError(
      null
    );

    setSuccess(
      null
    );

    try {
      const ticket =
        await supportService.create({
          category,

          subject:
            subject.trim(),

          message:
            message.trim(),

          ...(orderNumber.trim()
            ? {
                orderNumber:
                  orderNumber.trim(),
              }
            : {}),
        });

      setCategory(
        "ORDER"
      );

      setSubject(
        ""
      );

      setOrderNumber(
        ""
      );

      setMessage(
        ""
      );

      setSuccess(
        `We received ${ticket.ticketNumber}.`
      );

      await load();

      setSelectedId(
        ticket.id
      );

      router.replace(
        `/account/help?ticket=${encodeURIComponent(
          ticket.id
        )}`
      );
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to send your message."
        )
      );
    } finally {
      setCreating(
        false
      );
    }
  }

  async function sendReply(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !selected ||
      replying
    ) {
      return;
    }

    if (
      reply.trim().length <
      2
    ) {
      return;
    }

    setReplying(
      true
    );

    setError(
      null
    );

    try {
      await supportService.reply(
        selected.id,
        reply.trim()
      );

      setReply(
        ""
      );

      await load();

      setSelectedId(
        selected.id
      );
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to send your reply."
        )
      );
    } finally {
      setReplying(
        false
      );
    }
  }

  function selectTicket(
    ticket:
      SupportTicket
  ) {
    setSelectedId(
      ticket.id
    );

    router.replace(
      `/account/help?ticket=${encodeURIComponent(
        ticket.id
      )}`
    );
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
            Opening customer care...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-14">
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
            Need help?
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-9 border-b border-[#ded6cf] pb-9">
          <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
            Customer care
          </p>

          <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px]">
            How can we help?
          </h1>

          <p className="mt-4 max-w-2xl text-[10px] leading-6 !text-[#85746e]">
            Send us a message about an order, delivery, payment, fragrance or your account. Your conversation stays attached to your ÉLAN account.
          </p>
        </div>

        {/* INFO */}

        <div className="mt-8 grid gap-px border border-[#ded6cf] bg-[#ded6cf] sm:grid-cols-2 lg:grid-cols-4">
          <HelpStat
            icon={
              Package
            }
            label="Orders"
            text="Order questions"
          />

          <HelpStat
            icon={
              Truck
            }
            label="Delivery"
            text="Shipping help"
          />

          <HelpStat
            icon={
              CreditCard
            }
            label="Payments"
            text="Payment support"
          />

          <HelpStat
            icon={
              ShieldCheck
            }
            label="Account"
            text="Account assistance"
          />
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

        {/* MAIN GRID */}

        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.25fr]">
          {/* NEW REQUEST */}

          <form
            onSubmit={
              createTicket
            }
            className="border border-[#e5ddd3]"
          >
            <div className="border-b border-[#e5ddd3] p-6 sm:p-8">
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
                New request
              </p>

              <h2 className="mt-3 font-display text-[30px] !text-[#382724]">
                Tell us what happened.
              </h2>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <Field
                label="What do you need help with?"
              >
                <select
                  value={
                    category
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target.value as
                        SupportCategory
                    )
                  }
                  className="h-12 w-full border border-[#ddd4ce] bg-[#fbfaf7] px-4 text-[10px] !text-[#382724] outline-none focus:border-[#6b2230]"
                >
                  <option value="ORDER">
                    Order
                  </option>
                  <option value="DELIVERY">
                    Delivery
                  </option>
                  <option value="PAYMENT">
                    Payment
                  </option>
                  <option value="ACCOUNT">
                    Account
                  </option>
                  <option value="PRODUCT">
                    Product / fragrance
                  </option>
                  <option value="RETURNS">
                    Return
                  </option>
                  <option value="OTHER">
                    Something else
                  </option>
                </select>
              </Field>

              <Field
                label="Order number"
                optional
              >
                <input
                  value={
                    orderNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setOrderNumber(
                      event.target.value
                    )
                  }
                  placeholder="ELN-2026..."
                  className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 text-[10px] !text-[#382724] outline-none placeholder:!text-[#b1a19a] focus:border-[#6b2230]"
                />
              </Field>

              <Field
                label="Subject"
              >
                <input
                  value={
                    subject
                  }
                  onChange={(
                    event
                  ) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  maxLength={
                    140
                  }
                  placeholder="A short summary"
                  className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 text-[10px] !text-[#382724] outline-none placeholder:!text-[#b1a19a] focus:border-[#6b2230]"
                />
              </Field>

              <Field
                label="Message"
              >
                <textarea
                  value={
                    message
                  }
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  maxLength={
                    4000
                  }
                  rows={
                    7
                  }
                  placeholder="Give us the details that will help us understand what you need."
                  className="w-full resize-none border border-[#ddd4ce] bg-transparent px-4 py-4 text-[10px] leading-5 !text-[#382724] outline-none placeholder:!text-[#b1a19a] focus:border-[#6b2230]"
                />

                <p className="mt-2 text-right text-[7px] !text-[#a18e87]">
                  {
                    message.length
                  }
                  /4000
                </p>
              </Field>
            </div>

            <div className="flex justify-end border-t border-[#e5ddd3] p-6 sm:p-8">
              <button
                type="submit"
                disabled={
                  creating
                }
                className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#541627] px-6 text-[9px] font-medium !text-white disabled:opacity-45"
              >
                {creating ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    strokeWidth={
                      1.4
                    }
                  />
                ) : (
                  <Send
                    className="size-3.5"
                    strokeWidth={
                      1.4
                    }
                  />
                )}

                Send to ÉLAN
              </button>
            </div>
          </form>

          {/* CONVERSATIONS */}

          <section className="border border-[#e5ddd3]">
            <div className="border-b border-[#e5ddd3] p-6 sm:p-8">
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
                Your requests
              </p>

              <h2 className="mt-3 font-display text-[30px] !text-[#382724]">
                Conversations.
              </h2>
            </div>

            {tickets.length ===
              0 ? (
              <div className="flex min-h-[430px] items-center justify-center p-8 text-center">
                <div>
                  <MessageCircle
                    className="mx-auto size-6 !text-[#9a756c]"
                    strokeWidth={
                      1.3
                    }
                  />

                  <h3 className="mt-5 font-display text-[29px] !text-[#382724]">
                    No support requests.
                  </h3>

                  <p className="mt-2 max-w-sm text-[9px] leading-5 !text-[#88766f]">
                    If you need us, send a message using the form and the conversation will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid min-h-[520px] md:grid-cols-[250px_1fr]">
                <div className="border-b border-[#e5ddd3] md:border-b-0 md:border-r">
                  {tickets.map(
                    (
                      ticket
                    ) => (
                      <button
                        key={
                          ticket.id
                        }
                        type="button"
                        onClick={() =>
                          selectTicket(
                            ticket
                          )
                        }
                        className={`block w-full border-b border-[#e5ddd3] p-4 text-left transition ${
                          selectedId ===
                          ticket.id
                            ? "bg-[#f5efea]"
                            : "hover:bg-[#f8f4f0]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[8px] font-medium !text-[#5a4640]">
                            {
                              ticket.ticketNumber
                            }
                          </p>

                          <Status
                            status={
                              ticket.status
                            }
                          />
                        </div>

                        <p className="mt-2 line-clamp-2 text-[9px] font-medium leading-4 !text-[#3e2e29]">
                          {
                            ticket.subject
                          }
                        </p>

                        <p className="mt-2 text-[7px] !text-[#9b8982]">
                          {
                            formatDate(
                              ticket.updatedAt
                            )
                          }
                        </p>
                      </button>
                    )
                  )}
                </div>

                <div>
                  {selected ? (
                    <TicketConversation
                      ticket={
                        selected
                      }
                      reply={
                        reply
                      }
                      setReply={
                        setReply
                      }
                      replying={
                        replying
                      }
                      onSubmit={
                        sendReply
                      }
                    />
                  ) : (
                    <div className="flex min-h-[430px] items-center justify-center p-8 text-center">
                      <p className="text-[9px] !text-[#88766f]">
                        Choose a request to view the conversation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* AFTERCARE */}

        <div className="mt-4 grid border border-[#e5ddd3] sm:grid-cols-3">
          <Aftercare
            icon={
              Clock3
            }
            title="Your reference matters"
            text="Every request gets a unique reference so replies stay attached to the right conversation."
          />

          <Aftercare
            icon={
              RotateCcw
            }
            title="Returns stay separate"
            text="A support request can help you first; eligible returns and disputes continue through their dedicated order process."
            bordered
          />

          <Aftercare
            icon={
              UserRound
            }
            title="Human support"
            text="Replies from the ÉLAN team appear here and can also be sent to your account email."
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CONVERSATION
========================================================= */

function TicketConversation({
  ticket,
  reply,
  setReply,
  replying,
  onSubmit,
}: {
  ticket:
    SupportTicket;

  reply:
    string;

  setReply:
    (
      value:
        string
    ) =>
      void;

  replying:
    boolean;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>
    ) =>
      void;
}) {
  const closed =
    ticket.status ===
      "CLOSED";

  return (
    <div className="flex min-h-[520px] flex-col">
      <div className="border-b border-[#e5ddd3] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Status
            status={
              ticket.status
            }
          />

          <span className="text-[7px] uppercase tracking-[0.1em] !text-[#a18e87]">
            {
              formatEnum(
                ticket.category
              )
            }
          </span>
        </div>

        <h3 className="mt-3 font-display text-[24px] !text-[#382724]">
          {
            ticket.subject
          }
        </h3>

        {ticket.orderNumber && (
          <p className="mt-2 text-[8px] !text-[#8d7a73]">
            Order ·{" "}
            {
              ticket.orderNumber
            }
          </p>
        )}
      </div>

      <div className="flex-1 space-y-4 p-5">
        {ticket.messages.map(
          (
            item
          ) => {
            const customer =
              item.sender ===
              "CUSTOMER";

            return (
              <div
                key={
                  item.id
                }
                className={`flex ${
                  customer
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] p-4 ${
                    customer
                      ? "bg-[#541627] !text-white"
                      : "border border-[#e2d8d1] bg-[#f7f2ed]"
                  }`}
                >
                  <p
                    className={`text-[7px] font-medium uppercase tracking-[0.12em] ${
                      customer
                        ? "!text-white/65"
                        : "!text-[#927a72]"
                    }`}
                  >
                    {
                      customer
                        ? "You"
                        : item.senderName
                    }
                  </p>

                  <p
                    className={`mt-2 whitespace-pre-wrap text-[9px] leading-5 ${
                      customer
                        ? "!text-white"
                        : "!text-[#594740]"
                    }`}
                  >
                    {
                      item.message
                    }
                  </p>

                  <p
                    className={`mt-3 text-[7px] ${
                      customer
                        ? "!text-white/55"
                        : "!text-[#a08e87]"
                    }`}
                  >
                    {
                      formatDate(
                        item.createdAt
                      )
                    }
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>

      <form
        onSubmit={
          onSubmit
        }
        className="border-t border-[#e5ddd3] p-5"
      >
        <textarea
          value={
            reply
          }
          disabled={
            closed
          }
          onChange={(
            event
          ) =>
            setReply(
              event.target.value
            )
          }
          rows={
            3
          }
          placeholder={
            closed
              ? "This request is closed."
              : "Reply to ÉLAN Support..."
          }
          className="w-full resize-none border border-[#ddd4ce] bg-transparent px-4 py-3 text-[9px] leading-5 !text-[#382724] outline-none disabled:bg-[#f4f0ec] disabled:opacity-60 focus:border-[#6b2230]"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={
              closed ||
              replying ||
              reply.trim().length <
                2
            }
            className="inline-flex min-h-[40px] items-center gap-2 bg-[#541627] px-4 text-[8px] font-medium !text-white disabled:opacity-40"
          >
            {replying ? (
              <LoaderCircle
                className="size-3 animate-spin"
                strokeWidth={
                  1.4
                }
              />
            ) : (
              <Send
                className="size-3"
                strokeWidth={
                  1.4
                }
              />
            )}

            Reply
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function HelpStat({
  icon:
    Icon,

  label,
  text,
}: {
  icon:
    React.ElementType;

  label:
    string;

  text:
    string;
}) {
  return (
    <div className="bg-[#fbfaf7] p-5 sm:p-6">
      <Icon
        className="size-4 !text-[#8b6960]"
        strokeWidth={
          1.3
        }
      />

      <p className="mt-5 font-display text-[22px] !text-[#342725]">
        {
          label
        }
      </p>

      <p className="mt-2 text-[8px] !text-[#98857e]">
        {
          text
        }
      </p>
    </div>
  );
}

function Field({
  label,
  optional =
    false,
  children,
}: {
  label:
    string;

  optional?:
    boolean;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.15em] !text-[#806b64]">
        {
          label
        }

        {optional && (
          <span className="normal-case tracking-normal !text-[#ac9991]">
            {" "}
            · optional
          </span>
        )}
      </label>

      {
        children
      }
    </div>
  );
}

function Status({
  status,
}: {
  status:
    SupportTicket["status"];
}) {
  const classes =
    status ===
      "RESOLVED"
      ? "bg-[#e8eee8] !text-[#526357]"
      : status ===
          "CLOSED"
      ? "bg-[#ece8e5] !text-[#776c67]"
      : status ===
          "WAITING_FOR_CUSTOMER"
      ? "bg-[#eee8dd] !text-[#876b3d]"
      : status ===
          "IN_PROGRESS"
      ? "bg-[#e8edf2] !text-[#596979]"
      : "bg-[#f2e6e8] !text-[#7b3546]";

  return (
    <span
      className={`px-2 py-1 text-[6px] font-semibold uppercase tracking-[0.08em] ${classes}`}
    >
      {
        formatEnum(
          status
        )
      }
    </span>
  );
}

function Aftercare({
  icon:
    Icon,

  title,
  text,
  bordered =
    false,
}: {
  icon:
    React.ElementType;

  title:
    string;

  text:
    string;

  bordered?:
    boolean;
}) {
  return (
    <div
      className={`p-6 sm:p-8 ${
        bordered
          ? "border-y border-[#e5ddd3] sm:border-x sm:border-y-0"
          : ""
      }`}
    >
      <Icon
        className="size-4 !text-[#7e6259]"
        strokeWidth={
          1.3
        }
      />

      <h3 className="mt-4 font-display text-[21px] !text-[#382724]">
        {
          title
        }
      </h3>

      <p className="mt-3 text-[9px] leading-5 !text-[#88766f]">
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

const dateFormatter =
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

function formatDate(
  value:
    string
) {
  const parsed =
    new Date(
      value
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? value
    : dateFormatter.format(
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

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {
  return error instanceof
    Error
    ? error.message
    : fallback;
}
