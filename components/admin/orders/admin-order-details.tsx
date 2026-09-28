"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  CircleDollarSign,
  LoaderCircle,
  MapPin,
  Package,
  Save,
  Truck,
  UserRound,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  adminOrdersService,
  type AdminOrderDetail,
  type AdminOrderStatus,
} from "@/services/admin-orders.service";

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style:
        "currency",
      currency:
        "ZAR",
      maximumFractionDigits:
        0,
    }
  );

export function AdminOrderDetails({
  orderId,
}: {
  orderId:
    string;
}) {
  const [
    order,
    setOrder,
  ] = useState<
    AdminOrderDetail | null
  >(null);

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
    string | null
  >(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<
    string | null
  >(null);

  const [
    service,
    setService,
  ] = useState("");

  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState("");

  const [
    trackingUrl,
    setTrackingUrl,
  ] = useState("");

  const [
    shipmentStatus,
    setShipmentStatus,
  ] = useState(
    "PENDING"
  );

  const loadOrder =
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
            await adminOrdersService.getById(
              orderId
            );

          setOrder(
            response
          );

          setService(
            response.shipment
              ?.service ??
              (
                response.deliveryMethod ===
                "PAXI"
                  ? "PAXI"
                  : "Aramex"
              )
          );

          setTrackingNumber(
            response.shipment
              ?.trackingNumber ??
              ""
          );

          setTrackingUrl(
            response.shipment
              ?.trackingUrl ??
              ""
          );

          setShipmentStatus(
            response.shipment
              ?.status ??
              "PENDING"
          );
        } catch (
          error
        ) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load this order."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        orderId,
      ]
    );

  useEffect(
    () => {
      void loadOrder();
    },
    [
      loadOrder,
    ]
  );

  const nextActions =
    useMemo(
      () =>
        order
          ? availableActions(
              order.orderStatus,
              order.paymentMethod,
              order.paymentStatus
            )
          : [],
      [
        order,
      ]
    );

  async function changeStatus(
    status:
      AdminOrderStatus
  ) {
    if (
      !order
    ) {
      return;
    }

    const confirmed =
      status !==
        "CANCELLED" ||
      window.confirm(
        "Cancel this order? This cannot be used to refund an already-paid PayFast order."
      );

    if (
      !confirmed
    ) {
      return;
    }

    setActionLoading(
      status
    );

    try {
      const response =
        await adminOrdersService.updateStatus(
          order.id,
          {
            orderStatus:
              status,
          }
        );

      setOrder(
        response
      );

      toast.success(
        `Order moved to ${statusLabel(
          status
        )}.`
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  }

  async function saveShipment(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !order
    ) {
      return;
    }

    if (
      !service.trim()
    ) {
      toast.error(
        "Shipment service is required."
      );

      return;
    }

    setActionLoading(
      "SHIPMENT"
    );

    try {
      const response =
        await adminOrdersService.updateShipment(
          order.id,
          {
            provider:
              order.deliveryMethod,

            service:
              service.trim(),

            trackingNumber:
              trackingNumber.trim() ||
              undefined,

            trackingUrl:
              trackingUrl.trim() ||
              undefined,

            status:
              shipmentStatus.trim() ||
              "PENDING",

            collectionPointCode:
              order.paxi.pointCode ??
              undefined,

            collectionPointName:
              order.paxi.pointName ??
              undefined,
          }
        );

      setOrder(
        response
      );

      toast.success(
        "Shipment details saved."
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to save shipment."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  }

  if (
    loading
  ) {
    return (
      <div className="flex min-h-[620px] items-center justify-center bg-[#f7f5f2]">
        <LoaderCircle
          className="size-5 animate-spin !text-[#6b2230]"
          strokeWidth={
            1.4
          }
        />
      </div>
    );
  }

  if (
    error ||
    !order
  ) {
    return (
      <div className="flex min-h-[620px] items-center justify-center bg-[#f7f5f2] px-5 text-center">
        <div>
          <p className="font-display text-[34px] !text-[#382724]">
            Order unavailable.
          </p>

          <p className="mt-3 text-[10px] !text-[#8a7770]">
            {
              error ??
              "Order not found."
            }
          </p>

          <Link
            href="/admin/orders"
            className="mt-6 inline-flex border-b border-[#6b2230] pb-1 text-[9px] !text-[#6b2230]"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f5f2] px-5 py-8 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[1450px]">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-[9px] !text-[#76655f]"
        >
          <ArrowLeft
            className="size-3.5"
            strokeWidth={
              1.4
            }
          />

          Orders
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-5 border-b border-[#ded7d1] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] !text-[#9a756c]">
              {
                statusLabel(
                  order.orderStatus
                )
              }{" "}
              ·{" "}
              {
                order.customerType ===
                "GUEST"
                ? "Guest"
                : "Account"
              }
            </p>

            <h1 className="mt-3 font-display text-[42px] !text-[#342725] sm:text-[50px]">
              {
                order.orderNumber
              }
            </h1>

            <p className="mt-3 text-[10px] !text-[#82726b]">
              Placed{" "}
              {
                formatDateTime(
                  order.createdAt
                )
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextActions.map(
              (
                action
              ) => (
                <button
                  key={
                    action.status
                  }
                  type="button"
                  disabled={
                    actionLoading !==
                    null
                  }
                  onClick={() =>
                    void changeStatus(
                      action.status
                    )
                  }
                  className={`min-h-[44px] px-5 text-[9px] font-medium disabled:opacity-50 ${
                    action.status ===
                    "CANCELLED"
                      ? "border border-[#b89089] !text-[#8d4b45]"
                      : "bg-[#571628] !text-white"
                  }`}
                >
                  {actionLoading ===
                  action.status
                    ? "Updating..."
                    : action.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={
              CircleDollarSign
            }
            label="Total"
            value={
              currency.format(
                order.total
              )
            }
          />

          <Stat
            icon={
              Package
            }
            label="Items"
            value={
              String(
                order.itemCount
              )
            }
          />

          <Stat
            icon={
              CircleDollarSign
            }
            label="Payment"
            value={
              paymentLabel(
                order.paymentStatus
              )
            }
          />

          <Stat
            icon={
              Truck
            }
            label="Delivery"
            value={
              order.deliveryMethod
            }
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <Panel
              title="Items"
              eyebrow="Order"
            >
              <div className="divide-y divide-[#e8e0da]">
                {order.items.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      className="grid grid-cols-[72px_1fr_auto] gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="relative size-[72px] overflow-hidden bg-[#eee9e3]">
                        {item.imageUrl ? (
                          <Image
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.productName
                            }
                            fill
                            unoptimized
                            sizes="72px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div>
                        <Link
                          href={`/perfumes/${item.slug}`}
                          target="_blank"
                          className="font-display text-[20px] !text-[#382724]"
                        >
                          {
                            item.productName
                          }
                        </Link>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.12em] !text-[#95827a]">
                          {
                            item.size
                          }{" "}
                          ·{" "}
                          {
                            item.sku
                          }{" "}
                          · Qty{" "}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <p className="text-[10px] font-medium !text-[#382824]">
                        {
                          currency.format(
                            item.lineTotal
                          )
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </Panel>

            <div className="grid gap-5 md:grid-cols-2">
              <Panel
                title="Customer"
                eyebrow={
                  order.customerType
                }
              >
                <Info
                  label="Name"
                  value={`${order.customer.firstName} ${order.customer.lastName}`}
                />

                <Info
                  label="Email"
                  value={
                    order.email
                  }
                />

                <Info
                  label="Phone"
                  value={
                    order.customer.phone
                  }
                />
              </Panel>

              <Panel
                title="Shipping address"
                eyebrow="Delivery"
              >
                <div className="text-[10px] leading-6 !text-[#695853]">
                  <p>
                    {
                      order.deliveryAddress.addressLine1
                    }
                  </p>

                  {order.deliveryAddress.addressLine2 && (
                    <p>
                      {
                        order.deliveryAddress.addressLine2
                      }
                    </p>
                  )}

                  <p>
                    {
                      [
                        order.deliveryAddress.suburb,
                        order.deliveryAddress.city,
                        order.deliveryAddress.province,
                        order.deliveryAddress.postalCode,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )
                    }
                  </p>

                  <p>
                    {
                      order.deliveryAddress.country
                    }
                  </p>
                </div>
              </Panel>
            </div>

            {order.dispute && (
              <Panel
                title="Dispute"
                eyebrow={
                  order.dispute.status
                }
              >
                <Info
                  label="Reason"
                  value={
                    order.dispute.reason
                  }
                />

                <p className="mt-4 text-[10px] leading-6 !text-[#695853]">
                  {
                    order.dispute.description
                  }
                </p>
              </Panel>
            )}
          </div>

          <div className="space-y-5">
            <Panel
              title="Payment"
              eyebrow={
                paymentLabel(
                  order.paymentStatus
                )
              }
            >
              <Info
                label="Method"
                value={
                  order.paymentMethod ===
                  "PAYFAST"
                    ? "PayFast"
                    : "Cash on delivery"
                }
              />

              <Info
                label="Amount"
                value={
                  currency.format(
                    order.payment
                      ?.amount ??
                      order.total
                  )
                }
              />

              {order.payment?.providerPaymentId && (
                <Info
                  label="Provider reference"
                  value={
                    order.payment.providerPaymentId
                  }
                />
              )}
            </Panel>

            <Panel
              title="Shipment"
              eyebrow={
                order.deliveryMethod
              }
            >
              <form
                onSubmit={
                  saveShipment
                }
                className="space-y-4"
              >
                <Field
                  label="Service"
                  value={
                    service
                  }
                  onChange={
                    setService
                  }
                  placeholder="Aramex Domestic Express"
                />

                <Field
                  label="Tracking number"
                  value={
                    trackingNumber
                  }
                  onChange={
                    setTrackingNumber
                  }
                  placeholder="Tracking reference"
                />

                <Field
                  label="Tracking URL"
                  value={
                    trackingUrl
                  }
                  onChange={
                    setTrackingUrl
                  }
                  placeholder="https://..."
                />

                <Field
                  label="Shipment status"
                  value={
                    shipmentStatus
                  }
                  onChange={
                    setShipmentStatus
                  }
                  placeholder="PENDING"
                />

                {order.deliveryMethod ===
                  "PAXI" && (
                  <div className="border-t border-[#e8e0da] pt-4">
                    <Info
                      label="PAXI point"
                      value={
                        order.paxi.pointName ??
                        "Not selected"
                      }
                    />

                    <Info
                      label="Point code"
                      value={
                        order.paxi.pointCode ??
                        "—"
                      }
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    actionLoading !==
                    null
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 bg-[#571628] px-5 text-[9px] font-medium !text-white disabled:opacity-50"
                >
                  {actionLoading ===
                  "SHIPMENT" ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      strokeWidth={
                        1.4
                      }
                    />
                  ) : (
                    <Save
                      className="size-4"
                      strokeWidth={
                        1.4
                      }
                    />
                  )}

                  Save shipment
                </button>
              </form>
            </Panel>

            <Panel
              title="Timeline"
              eyebrow="Progress"
            >
              <Timeline
                order={
                  order
                }
              />
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function availableActions(
  status:
    AdminOrderStatus,
  paymentMethod:
    string,
  paymentStatus:
    string
) {
  switch (
    status
  ) {
    case "PENDING_PAYMENT":
      return [
        ...(
          paymentMethod ===
            "CASH_ON_DELIVERY" ||
          paymentStatus ===
            "COMPLETE" ||
          paymentStatus ===
            "PAID"
            ? [
                {
                  label:
                    "Mark processing",
                  status:
                    "PROCESSING" as const,
                },
              ]
            : []
        ),
        {
          label:
            "Cancel",
          status:
            "CANCELLED" as const,
        },
      ];

    case "PROCESSING":
      return [
        {
          label:
            "Mark packing",
          status:
            "PACKING" as const,
        },
        {
          label:
            "Cancel",
          status:
            "CANCELLED" as const,
        },
      ];

    case "PACKING":
      return [
        {
          label:
            "Mark ready",
          status:
            "READY_FOR_SHIPMENT" as const,
        },
        {
          label:
            "Cancel",
          status:
            "CANCELLED" as const,
        },
      ];

    case "READY_FOR_SHIPMENT":
      return [
        {
          label:
            "Mark shipped",
          status:
            "SHIPPED" as const,
        },
        {
          label:
            "Cancel",
          status:
            "CANCELLED" as const,
        },
      ];

    case "SHIPPED":
      return [
        {
          label:
            "Mark delivered",
          status:
            "DELIVERED" as const,
        },
      ];

    case "DELIVERED":
      return [
        {
          label:
            "Start return",
          status:
            "RETURN_REQUESTED" as const,
        },
      ];

    case "RETURN_REQUESTED":
      return [
        {
          label:
            "Mark returned",
          status:
            "RETURNED" as const,
        },
      ];

    default:
      return [];
  }
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow:
    string;
  title:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="border border-[#e1dad4] bg-[#fbfaf7] p-5 sm:p-6">
      <p className="text-[8px] font-medium uppercase tracking-[0.18em] !text-[#9a756c]">
        {
          eyebrow
        }
      </p>

      <h2 className="mt-2 font-display text-[27px] !text-[#382724]">
        {
          title
        }
      </h2>

      <div className="mt-5">
        {
          children
        }
      </div>
    </div>
  );
}

function Stat({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof Package;
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="border border-[#e1dad4] bg-[#fbfaf7] p-5">
      <Icon
        className="size-4 !text-[#6b2230]"
        strokeWidth={
          1.4
        }
      />

      <p className="mt-4 text-[8px] uppercase tracking-[0.15em] !text-[#94817a]">
        {
          label
        }
      </p>

      <p className="mt-2 font-display text-[25px] !text-[#382724]">
        {
          value
        }
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#e8e0da] py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="text-[8px] uppercase tracking-[0.12em] !text-[#998780]">
        {
          label
        }
      </span>

      <span className="max-w-[65%] text-right text-[9px] font-medium !text-[#493732]">
        {
          value
        }
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label:
    string;
  value:
    string;
  onChange:
    (
      value:
        string
    ) =>
      void;
  placeholder:
    string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] uppercase tracking-[0.13em] !text-[#998780]">
        {
          label
        }
      </span>

      <input
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
        placeholder={
          placeholder
        }
        className="h-11 w-full border border-[#ddd4ce] bg-transparent px-3 text-[9px] !text-[#493732] outline-none focus:border-[#6b2230]"
      />
    </label>
  );
}

function Timeline({
  order,
}: {
  order:
    AdminOrderDetail;
}) {
  const entries = [
    {
      label:
        "Order placed",
      value:
        order.createdAt,
    },
    {
      label:
        "Payment confirmed",
      value:
        order.paidAt,
    },
    {
      label:
        "Shipped",
      value:
        order.shippedAt,
    },
    {
      label:
        "Delivered",
      value:
        order.deliveredAt,
    },
  ].filter(
    (
      entry
    ) =>
      Boolean(
        entry.value
      )
  );

  return (
    <div className="space-y-4">
      {entries.map(
        (
          entry
        ) => (
          <div
            key={
              entry.label
            }
            className="flex gap-3"
          >
            <div className="mt-1.5 size-2 rounded-full bg-[#6b2230]" />

            <div>
              <p className="text-[9px] font-medium !text-[#493732]">
                {
                  entry.label
                }
              </p>

              <p className="mt-1 text-[8px] !text-[#998780]">
                {
                  formatDateTime(
                    entry.value!
                  )
                }
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function statusLabel(
  status:
    string
) {
  return status
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );
}

function paymentLabel(
  status:
    string
) {
  if (
    status ===
      "COMPLETE" ||
    status ===
      "PAID"
  ) {
    return "Paid";
  }

  return statusLabel(
    status
  );
}

function formatDateTime(
  value:
    string
) {
  return new Intl.DateTimeFormat(
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
  ).format(
    new Date(
      value
    )
  );
}
