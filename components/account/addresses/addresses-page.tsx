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
  Check,
  CircleAlert,
  Edit3,
  Home,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  addressesService,
  type AccountAddress,
  type AddressPayload,
} from "@/services/addresses.service";

/* =========================================================
   CONSTANTS
========================================================= */

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

const emptyForm:
  AddressFormState = {
    label:
      "Home",

    recipientName:
      "",

    phone:
      "",

    addressLine1:
      "",

    addressLine2:
      "",

    suburb:
      "",

    city:
      "",

    province:
      "Gauteng",

    postalCode:
      "",

    country:
      "South Africa",

    isDefault:
      false,
  };

/* =========================================================
   PAGE
========================================================= */

export function AddressesPage() {
  const router =
    useRouter();

  const [
    addresses,
    setAddresses,
  ] = useState<
    AccountAddress[]
  >([]);

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
    formOpen,
    setFormOpen,
  ] = useState(
    false
  );

  const [
    editing,
    setEditing,
  ] = useState<
    AccountAddress |
    null
  >(
    null
  );

  const [
    form,
    setForm,
  ] = useState<
    AddressFormState
  >(
    emptyForm
  );

  const [
    saving,
    setSaving,
  ] = useState(
    false
  );

  const [
    actionId,
    setActionId,
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
            await addressesService.getAll();

          setAddresses(
            response
          );
        } catch (
          error
        ) {
          const message =
            getErrorMessage(
              error,
              "Unable to load your addresses."
            );

          if (
            isUnauthorized(
              message
            )
          ) {
            router.replace(
              "/login?redirect=%2Faccount%2Faddresses"
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

  const defaultAddress =
    useMemo(
      () =>
        addresses.find(
          (
            address
          ) =>
            address.isDefault
        ) ??
        null,
      [
        addresses,
      ]
    );

  function openCreate() {
    setEditing(
      null
    );

    setForm({
      ...emptyForm,

      isDefault:
        addresses.length ===
        0,
    });

    setError(
      null
    );

    setSuccess(
      null
    );

    setFormOpen(
      true
    );
  }

  function openEdit(
    address:
      AccountAddress
  ) {
    setEditing(
      address
    );

    setForm({
      label:
        address.label ??
        "",

      recipientName:
        address.recipientName,

      phone:
        address.phone,

      addressLine1:
        address.addressLine1,

      addressLine2:
        address.addressLine2 ??
        "",

      suburb:
        address.suburb ??
        "",

      city:
        address.city,

      province:
        address.province,

      postalCode:
        address.postalCode,

      country:
        address.country,

      isDefault:
        address.isDefault,
    });

    setError(
      null
    );

    setSuccess(
      null
    );

    setFormOpen(
      true
    );
  }

  function closeForm() {
    if (
      saving
    ) {
      return;
    }

    setFormOpen(
      false
    );

    setEditing(
      null
    );

    setForm(
      emptyForm
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      saving
    ) {
      return;
    }

    const validation =
      validateAddressForm(
        form
      );

    if (
      validation
    ) {
      setError(
        validation
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

    const payload:
      AddressPayload = {
        label:
          cleanOptional(
            form.label
          ),

        recipientName:
          form.recipientName.trim(),

        phone:
          form.phone.trim(),

        addressLine1:
          form.addressLine1.trim(),

        addressLine2:
          cleanOptional(
            form.addressLine2
          ),

        suburb:
          cleanOptional(
            form.suburb
          ),

        city:
          form.city.trim(),

        province:
          form.province.trim(),

        postalCode:
          form.postalCode.trim(),

        country:
          form.country.trim() ||
          "South Africa",

        isDefault:
          form.isDefault,
      };

    try {
      if (
        editing
      ) {
        await addressesService.update(
          editing.id,
          payload
        );

        setSuccess(
          "Address updated."
        );
      } else {
        await addressesService.create(
          payload
        );

        setSuccess(
          "Address added."
        );
      }

      setFormOpen(
        false
      );

      setEditing(
        null
      );

      await load();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to save this address."
        )
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function makeDefault(
    address:
      AccountAddress
  ) {
    if (
      address.isDefault ||
      actionId
    ) {
      return;
    }

    setActionId(
      address.id
    );

    setError(
      null
    );

    try {
      await addressesService.setDefault(
        address.id
      );

      setSuccess(
        `${address.label || "Address"} is now your default delivery address.`
      );

      await load();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to change your default address."
        )
      );
    } finally {
      setActionId(
        null
      );
    }
  }

  async function remove(
    address:
      AccountAddress
  ) {
    if (
      actionId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${address.label || "this address"}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setActionId(
      address.id
    );

    setError(
      null
    );

    try {
      await addressesService.remove(
        address.id
      );

      setSuccess(
        "Address removed."
      );

      await load();
    } catch (
      error
    ) {
      setError(
        getErrorMessage(
          error,
          "Unable to remove this address."
        )
      );
    } finally {
      setActionId(
        null
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

          <p className="mt-4 text-[9px] !text-[#8a7871]">
            Loading your addresses...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-14">
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
            Addresses
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-9 flex flex-col gap-6 border-b border-[#ded6cf] pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
              Delivery
            </p>

            <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px]">
              Your addresses.
            </h1>

            <p className="mt-4 max-w-xl text-[10px] leading-6 !text-[#85746e]">
              Save the places you regularly send ÉLAN orders to and choose one as your default delivery address.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreate
            }
            className="inline-flex min-h-[46px] w-fit items-center gap-2 bg-[#541627] px-5 text-[9px] font-medium !text-white transition hover:bg-[#6b2230]"
          >
            <Plus
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />

            Add address
          </button>
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

        {/* SUMMARY */}

        <div className="mt-8 grid gap-px border border-[#ded6cf] bg-[#ded6cf] sm:grid-cols-2">
          <div className="bg-[#fbfaf7] p-6">
            <p className="text-[8px] uppercase tracking-[0.17em] !text-[#90766e]">
              Saved addresses
            </p>

            <p className="mt-5 font-display text-[36px] !text-[#342725]">
              {
                addresses.length
              }
            </p>
          </div>

          <div className="bg-[#fbfaf7] p-6">
            <p className="text-[8px] uppercase tracking-[0.17em] !text-[#90766e]">
              Default delivery
            </p>

            <p className="mt-5 truncate font-display text-[25px] !text-[#342725]">
              {
                defaultAddress
                  ? defaultAddress.label ||
                    defaultAddress.city
                  : "Not set"
              }
            </p>
          </div>
        </div>

        {/* ADDRESSES */}

        {addresses.length >
          0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {addresses.map(
              (
                address
              ) => (
                <AddressCard
                  key={
                    address.id
                  }
                  address={
                    address
                  }
                  loading={
                    actionId ===
                    address.id
                  }
                  onEdit={() =>
                    openEdit(
                      address
                    )
                  }
                  onDefault={() =>
                    void makeDefault(
                      address
                    )
                  }
                  onDelete={() =>
                    void remove(
                      address
                    )
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-8 flex min-h-[340px] items-center justify-center border border-[#e5ddd3] px-6 text-center">
            <div>
              <MapPin
                className="mx-auto size-6 !text-[#9a756c]"
                strokeWidth={
                  1.3
                }
              />

              <h2 className="mt-5 font-display text-[32px] !text-[#382724]">
                No saved addresses.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[9px] leading-5 !text-[#88766f]">
                Add your first delivery address so it can be reused when you check out while signed in.
              </p>

              <button
                type="button"
                onClick={
                  openCreate
                }
                className="mt-6 inline-flex items-center gap-2 bg-[#541627] px-5 py-3 text-[9px] font-medium !text-white"
              >
                <Plus
                  className="size-3.5"
                  strokeWidth={
                    1.4
                  }
                />

                Add your first address
              </button>
            </div>
          </div>
        )}

        {/* INFO */}

        <div className="mt-4 grid border border-[#e5ddd3] sm:grid-cols-2">
          <InfoBlock
            icon={
              Home
            }
            title="Default address"
            description="Your default is shown first and can be preselected during account checkout."
          />

          <InfoBlock
            icon={
              MapPin
            }
            title="Order history stays unchanged"
            description="Editing a saved address does not rewrite addresses already captured on previous orders."
            bordered
          />
        </div>
      </div>

      {/* MODAL */}

      {formOpen && (
        <AddressEditor
          editing={
            editing
          }
          form={
            form
          }
          setForm={
            setForm
          }
          saving={
            saving
          }
          onClose={
            closeForm
          }
          onSubmit={
            submit
          }
        />
      )}
    </section>
  );
}

/* =========================================================
   ADDRESS CARD
========================================================= */

function AddressCard({
  address,
  loading,
  onEdit,
  onDefault,
  onDelete,
}: {
  address:
    AccountAddress;

  loading:
    boolean;

  onEdit:
    () =>
      void;

  onDefault:
    () =>
      void;

  onDelete:
    () =>
      void;
}) {
  return (
    <article
      className={`relative flex min-h-[300px] flex-col border p-6 sm:p-7 ${
        address.isDefault
          ? "border-[#8d5c68] bg-[#faf6f3]"
          : "border-[#e5ddd3] bg-[#fbfaf7]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[26px] !text-[#382724]">
              {
                address.label ||
                "Address"
              }
            </h2>

            {address.isDefault && (
              <span className="inline-flex items-center gap-1 bg-[#efe1e4] px-2 py-1 text-[7px] font-medium uppercase tracking-[0.08em] !text-[#6b2230]">
                <Star
                  className="size-2.5"
                  fill="currentColor"
                  strokeWidth={
                    1.2
                  }
                />

                Default
              </span>
            )}
          </div>

          <p className="mt-5 text-[10px] font-medium !text-[#4d3934]">
            {
              address.recipientName
            }
          </p>

          <div className="mt-3 space-y-1 text-[9px] leading-5 !text-[#82716b]">
            <p>
              {
                address.addressLine1
              }
            </p>

            {address.addressLine2 && (
              <p>
                {
                  address.addressLine2
                }
              </p>
            )}

            {address.suburb && (
              <p>
                {
                  address.suburb
                }
              </p>
            )}

            <p>
              {
                address.city
              }
              ,{" "}
              {
                address.province
              }
            </p>

            <p>
              {
                address.postalCode
              }
              {" · "}
              {
                address.country
              }
            </p>

            <p className="pt-2 !text-[#6e5a54]">
              {
                address.phone
              }
            </p>
          </div>
        </div>

        {loading && (
          <LoaderCircle
            className="size-4 animate-spin !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#e5ddd3] pt-5">
        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onEdit
          }
          className="inline-flex items-center gap-1.5 text-[8px] font-medium !text-[#654f49] disabled:opacity-40"
        >
          <Edit3
            className="size-3"
            strokeWidth={
              1.4
            }
          />

          Edit
        </button>

        {!address.isDefault && (
          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onDefault
            }
            className="inline-flex items-center gap-1.5 text-[8px] font-medium !text-[#6b2230] disabled:opacity-40"
          >
            <Star
              className="size-3"
              strokeWidth={
                1.4
              }
            />

            Make default
          </button>
        )}

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onDelete
          }
          className="ml-auto inline-flex items-center gap-1.5 text-[8px] font-medium !text-[#965950] disabled:opacity-40"
        >
          <Trash2
            className="size-3"
            strokeWidth={
              1.4
            }
          />

          Remove
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   EDITOR
========================================================= */

function AddressEditor({
  editing,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}: {
  editing:
    AccountAddress |
    null;

  form:
    AddressFormState;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        AddressFormState
      >
    >;

  saving:
    boolean;

  onClose:
    () =>
      void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>
    ) =>
      void;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-[2px]">
      <div className="mx-auto max-w-[760px] border border-[#ded6cf] bg-[#fbfaf7] shadow-[0_35px_90px_rgba(38,20,23,0.22)]">
        <div className="flex items-start justify-between gap-5 border-b border-[#e5ddd3] p-6 sm:p-8">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
              {
                editing
                  ? "Edit address"
                  : "New address"
              }
            </p>

            <h2 className="mt-3 font-display text-[32px] !text-[#382724]">
              Delivery details.
            </h2>
          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            aria-label="Close address editor"
            className="flex size-9 items-center justify-center !text-[#7b6862] disabled:opacity-40"
          >
            <X
              className="size-4"
              strokeWidth={
                1.4
              }
            />
          </button>
        </div>

        <form
          onSubmit={
            onSubmit
          }
        >
          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <InputField
              label="Label"
              value={
                form.label
              }
              placeholder="Home, Work..."
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "label",
                  value
                )
              }
            />

            <InputField
              label="Recipient name"
              value={
                form.recipientName
              }
              required
              autoComplete="name"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "recipientName",
                  value
                )
              }
            />

            <InputField
              label="Phone number"
              value={
                form.phone
              }
              required
              autoComplete="tel"
              placeholder="+27..."
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "phone",
                  value
                )
              }
            />

            <InputField
              label="Address line 1"
              value={
                form.addressLine1
              }
              required
              autoComplete="address-line1"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "addressLine1",
                  value
                )
              }
            />

            <InputField
              label="Address line 2"
              value={
                form.addressLine2
              }
              autoComplete="address-line2"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "addressLine2",
                  value
                )
              }
            />

            <InputField
              label="Suburb"
              value={
                form.suburb
              }
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "suburb",
                  value
                )
              }
            />

            <InputField
              label="City"
              value={
                form.city
              }
              required
              autoComplete="address-level2"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "city",
                  value
                )
              }
            />

            <div>
              <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.15em] !text-[#806b64]">
                Province{" "}
                <span className="!text-[#9a4f4f]">
                  *
                </span>
              </label>

              <select
                value={
                  form.province
                }
                onChange={(
                  event
                ) =>
                  patchForm(
                    setForm,
                    "province",
                    event.target.value
                  )
                }
                autoComplete="address-level1"
                className="h-12 w-full border border-[#ddd4ce] bg-[#fbfaf7] px-4 text-[10px] !text-[#382724] outline-none focus:border-[#6b2230]"
              >
                {provinces.map(
                  (
                    province
                  ) => (
                    <option
                      key={
                        province
                      }
                      value={
                        province
                      }
                    >
                      {
                        province
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <InputField
              label="Postal code"
              value={
                form.postalCode
              }
              required
              autoComplete="postal-code"
              inputMode="numeric"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "postalCode",
                  value
                )
              }
            />

            <InputField
              label="Country"
              value={
                form.country
              }
              required
              autoComplete="country-name"
              onChange={(
                value
              ) =>
                patchForm(
                  setForm,
                  "country",
                  value
                )
              }
            />

            <label className="flex cursor-pointer items-center gap-3 border border-[#e5ddd3] p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={
                  form.isDefault
                }
                disabled={
                  editing?.isDefault
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      isDefault:
                        event.target.checked,
                    })
                  )
                }
                className="size-4 accent-[#6b2230]"
              />

              <div>
                <p className="text-[9px] font-medium !text-[#493732]">
                  Use as my default delivery address
                </p>

                <p className="mt-1 text-[8px] leading-4 !text-[#918079]">
                  {
                    editing?.isDefault
                      ? "This is already your default. Choose another address as default to change it."
                      : "This address will be preselected when a default is needed."
                  }
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e5ddd3] p-6 sm:flex-row sm:justify-end sm:p-8">
            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onClose
              }
              className="min-h-[44px] border border-[#d9cec8] px-5 text-[9px] !text-[#6f5e58] disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#541627] px-6 text-[9px] font-medium !text-white disabled:opacity-45"
            >
              {saving ? (
                <LoaderCircle
                  className="size-3.5 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <Check
                  className="size-3.5"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              {
                editing
                  ? "Save changes"
                  : "Save address"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  required =
    false,
  placeholder,
  autoComplete,
  inputMode,
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

  required?:
    boolean;

  placeholder?:
    string;

  autoComplete?:
    string;

  inputMode?:
    "numeric" |
    "tel" |
    "text";
}) {
  return (
    <div>
      <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.15em] !text-[#806b64]">
        {
          label
        }

        {required && (
          <span className="!text-[#9a4f4f]">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        value={
          value
        }
        required={
          required
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        inputMode={
          inputMode
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="h-12 w-full border border-[#ddd4ce] bg-transparent px-4 text-[10px] !text-[#382724] outline-none transition placeholder:!text-[#b2a29c] focus:border-[#6b2230]"
      />
    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function InfoBlock({
  icon:
    Icon,

  title,
  description,
  bordered =
    false,
}: {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;

  bordered?:
    boolean;
}) {
  return (
    <div
      className={`p-6 sm:p-8 ${
        bordered
          ? "border-t border-[#e5ddd3] sm:border-l sm:border-t-0"
          : ""
      }`}
    >
      <Icon
        className="size-4 !text-[#7e6259]"
        strokeWidth={
          1.3
        }
      />

      <h3 className="mt-4 font-display text-[22px] !text-[#382724]">
        {
          title
        }
      </h3>

      <p className="mt-3 text-[9px] leading-5 !text-[#88766f]">
        {
          description
        }
      </p>
    </div>
  );
}

/* =========================================================
   TYPES / HELPERS
========================================================= */

type AddressFormState = {
  label:
    string;

  recipientName:
    string;

  phone:
    string;

  addressLine1:
    string;

  addressLine2:
    string;

  suburb:
    string;

  city:
    string;

  province:
    string;

  postalCode:
    string;

  country:
    string;

  isDefault:
    boolean;
};

function patchForm(
  setter:
    React.Dispatch<
      React.SetStateAction<
        AddressFormState
      >
    >,

  key:
    keyof AddressFormState,

  value:
    string
) {
  setter(
    (
      current
    ) => ({
      ...current,

      [key]:
        value,
    })
  );
}

function validateAddressForm(
  form:
    AddressFormState
) {
  if (
    form.recipientName.trim().length <
    2
  ) {
    return "Enter the recipient's full name.";
  }

  if (
    form.phone.trim().length <
    7
  ) {
    return "Enter a valid phone number.";
  }

  if (
    form.addressLine1.trim().length <
    3
  ) {
    return "Enter the street address.";
  }

  if (
    form.city.trim().length <
    2
  ) {
    return "Enter the city.";
  }

  if (
    form.province.trim().length <
    2
  ) {
    return "Choose a province.";
  }

  if (
    form.postalCode.trim().length <
    3
  ) {
    return "Enter a valid postal code.";
  }

  if (
    form.country.trim().length <
    2
  ) {
    return "Enter the country.";
  }

  return null;
}

function cleanOptional(
  value:
    string
) {
  const cleaned =
    value.trim();

  return cleaned ||
    undefined;
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
