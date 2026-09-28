"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  productsService,
  type CreateProductPayload,
  type UploadedProductImage,
} from "@/services/products.service";

import {
  ScentFinderProfileEditor,
} from "@/components/admin/products/scent-finder-profile-editor";

import type {
  ScentProfileValue,
} from "@/lib/scent-finder-options";

/* =========================================================
   TYPES
========================================================= */

type Audience =
  | "Women"
  | "Men"
  | "Unisex";

type ProductStatus =
  | "Draft"
  | "Active";

type ProductVariant = {
  id: string;
  size: string;
  price: string;
  stock: string;
  sku: string;
};

type NoteGroup = {
  top: string[];
  heart: string[];
  base: string[];
};

type ProductForm = {
  name: string;
  slug: string;

  shortDescription: string;
  story: string;

  family: string;
  concentration: string;
  audience: Audience;

  badge: string;
  status: ProductStatus;

  feeling: string;
  longevity: string;
  sillage: string;
  season: string;

  seoTitle: string;
  seoDescription: string;
};

/* =========================================================
   INITIAL VALUES
========================================================= */

const initialForm: ProductForm = {
  name: "",
  slug: "",

  shortDescription: "",
  story: "",

  family: "Amber",
  concentration: "Eau de parfum",
  audience: "Unisex",

  badge: "",
  status: "Draft",

  feeling: "",
  longevity: "",
  sillage: "",
  season: "",

  seoTitle: "",
  seoDescription: "",
};

const initialVariants: ProductVariant[] = [
  {
    id: "initial-30",
    size: "30 ML",
    price: "",
    stock: "",
    sku: "",
  },
  {
    id: "initial-50",
    size: "50 ML",
    price: "",
    stock: "",
    sku: "",
  },
  {
    id: "initial-100",
    size: "100 ML",
    price: "",
    stock: "",
    sku: "",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export function AdminCreateProductPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    scentProfile,
    setScentProfile,
  ] = useState<ScentProfileValue>({
    occasions: [],
    moods: [],
    personalities: [],
  });

  const [form, setForm] =
    useState<ProductForm>(
      initialForm
    );

  const [variants, setVariants] =
    useState<ProductVariant[]>(
      initialVariants
    );

  const [notes, setNotes] =
    useState<NoteGroup>({
      top: [],
      heart: [],
      base: [],
    });

  const [
    noteInputs,
    setNoteInputs,
  ] = useState({
    top: "",
    heart: "",
    base: "",
  });

  /* =======================================================
     IMAGE
  ======================================================== */

  const [
    imageFile,
    setImageFile,
  ] = useState<File | null>(
    null
  );

  const [
    imagePreview,
    setImagePreview,
  ] = useState<string | null>(
    null
  );

  const [
    imageName,
    setImageName,
  ] = useState<string | null>(
    null
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /* =======================================================
     SUMMARY
  ======================================================== */

  const totalStock =
    useMemo(() => {
      return variants.reduce(
        (total, variant) => {
          const stock =
            Number.parseInt(
              variant.stock ||
              "0",
              10
            );

          if (
            !Number.isFinite(
              stock
            )
          ) {
            return total;
          }

          return (
            total + stock
          );
        },
        0
      );
    }, [variants]);

  const startingPrice =
    useMemo(() => {
      const prices =
        variants
          .map((variant) =>
            Number.parseFloat(
              variant.price
            )
          )
          .filter(
            (price) =>
              Number.isFinite(
                price
              ) &&
              price > 0
          );

      if (
        prices.length === 0
      ) {
        return null;
      }

      return Math.min(
        ...prices
      );
    }, [variants]);

  /* =======================================================
     FORM
  ======================================================== */

  function updateForm<
    K extends keyof ProductForm,
  >(
    key: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function generateSlug(
    value: string
  ) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  }

  function handleNameChange(
    value: string
  ) {
    setForm((current) => {
      const currentAutomaticTitle =
        current.name
          ? `${current.name} | Élan Parfums`
          : "";

      const shouldUpdateSeo =
        !current.seoTitle ||
        current.seoTitle ===
        currentAutomaticTitle;

      return {
        ...current,

        name: value,

        slug:
          generateSlug(value),

        seoTitle:
          shouldUpdateSeo
            ? value
              ? `${value} | Élan Parfums`
              : ""
            : current.seoTitle,
      };
    });
  }

  /* =======================================================
     VARIANTS
  ======================================================== */

  function updateVariant(
    id: string,
    key: keyof Omit<
      ProductVariant,
      "id"
    >,
    value: string
  ) {
    setVariants(
      (current) =>
        current.map(
          (variant) =>
            variant.id === id
              ? {
                ...variant,
                [key]: value,
              }
              : variant
        )
    );
  }

  function addVariant() {
    setVariants(
      (current) => [
        ...current,

        {
          id:
            crypto.randomUUID(),

          size: "",
          price: "",
          stock: "",
          sku: "",
        },
      ]
    );
  }

  function removeVariant(
    id: string
  ) {
    if (
      variants.length <= 1
    ) {
      toast.error(
        "A product must have at least one variant."
      );

      return;
    }

    setVariants(
      (current) =>
        current.filter(
          (variant) =>
            variant.id !== id
        )
    );
  }

  /* =======================================================
     NOTES
  ======================================================== */

  function addNote(
    type: keyof NoteGroup
  ) {
    const value =
      noteInputs[type].trim();

    if (!value) {
      return;
    }

    const duplicate =
      notes[type].some(
        (note) =>
          note.toLowerCase() ===
          value.toLowerCase()
      );

    if (duplicate) {
      toast.error(
        `${value} has already been added.`
      );

      return;
    }

    setNotes(
      (current) => ({
        ...current,

        [type]: [
          ...current[type],
          value,
        ],
      })
    );

    setNoteInputs(
      (current) => ({
        ...current,
        [type]: "",
      })
    );
  }

  function removeNote(
    type: keyof NoteGroup,
    note: string
  ) {
    setNotes(
      (current) => ({
        ...current,

        [type]:
          current[type].filter(
            (item) =>
              item !== note
          ),
      })
    );
  }

  /* =======================================================
     IMAGE
  ======================================================== */

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      toast.error(
        "Choose a JPG, PNG or WebP image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Product image must be smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setImageFile(file);

    setImagePreview(
      preview
    );

    setImageName(
      file.name
    );
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(null);

    setImagePreview(null);

    setImageName(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /* =======================================================
     SUBMIT
  ======================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const name =
      form.name.trim();

    const slug =
      generateSlug(
        form.slug
      );

    const shortDescription =
      form.shortDescription.trim();

    /* =============================================
       BASIC VALIDATION
    ============================================== */

    if (
      name.length < 2
    ) {
      toast.error(
        "Enter a product name."
      );

      return;
    }

    if (!slug) {
      toast.error(
        "Enter a product slug."
      );

      return;
    }

    if (
      shortDescription.length <
      3
    ) {
      toast.error(
        "Add a short product description."
      );

      return;
    }

    if (
      variants.length === 0
    ) {
      toast.error(
        "Add at least one product size."
      );

      return;
    }

    /* =============================================
       VARIANT VALIDATION
    ============================================== */

    for (
      const variant of
      variants
    ) {
      const size =
        variant.size.trim();

      const price =
        Number(
          variant.price
        );

      const stock =
        Number(
          variant.stock
        );

      if (!size) {
        toast.error(
          "Every variant needs a size."
        );

        return;
      }

      if (
        !variant.price.trim() ||
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        toast.error(
          `${size}: price must be greater than zero.`
        );

        return;
      }

      if (
        !variant.stock.trim() ||
        !Number.isInteger(
          stock
        ) ||
        stock < 0
      ) {
        toast.error(
          `${size}: stock must be zero or greater.`
        );

        return;
      }
    }

    /* =============================================
       DUPLICATE SIZES
    ============================================== */

    const normalizedSizes =
      variants.map(
        (variant) =>
          variant.size
            .trim()
            .toUpperCase()
      );

    if (
      new Set(
        normalizedSizes
      ).size !==
      normalizedSizes.length
    ) {
      toast.error(
        "Product variants cannot have duplicate sizes."
      );

      return;
    }

    /* =============================================
       DUPLICATE SKUS
    ============================================== */

    const enteredSkus =
      variants
        .map(
          (variant) =>
            variant.sku
              .trim()
              .toUpperCase()
        )
        .filter(Boolean);

    if (
      new Set(
        enteredSkus
      ).size !==
      enteredSkus.length
    ) {
      toast.error(
        "Each variant must have a unique SKU."
      );

      return;
    }

    /* =============================================
       SCENT FINDER VALIDATION
    ============================================== */

    if (
      scentProfile.occasions.length === 0 ||
      scentProfile.moods.length === 0 ||
      scentProfile.personalities.length === 0
    ) {
      toast.error(
        "Choose at least one Scent Finder option in each category."
      );

      return;
    }

    setIsSubmitting(true);

    const toastId =
      toast.loading(
        "Preparing fragrance..."
      );

    let uploadedImage:
      | UploadedProductImage
      | null = null;

    try {
      /* =============================================
         CLOUDINARY UPLOAD
      ============================================== */

      if (imageFile) {
        toast.loading(
          "Uploading product image...",
          {
            id: toastId,
          }
        );

        uploadedImage =
          await productsService.uploadImage(
            imageFile
          );
      }




      /* =============================================
         BUILD REAL BACKEND PAYLOAD
      ============================================== */

      toast.loading(
        form.status ===
          "Active"
          ? "Publishing fragrance..."
          : "Saving fragrance draft...",
        {
          id: toastId,
        }
      );

      const payload: CreateProductPayload =
      {
        name,

        slug,

        shortDescription,

        story:
          form.story.trim() ||
          undefined,

        family:
          form.family.trim(),

        concentration:
          form.concentration.trim(),

        audience:
          form.audience,

        badge:
          form.badge.trim() ||
          undefined,

        status:
          form.status,

        feeling:
          form.feeling.trim() ||
          undefined,

        longevity:
          form.longevity.trim() ||
          undefined,

        sillage:
          form.sillage.trim() ||
          undefined,

        season:
          form.season.trim() ||
          undefined,

        scentOccasions:
          scentProfile.occasions,

        scentMoods:
          scentProfile.moods,

        scentPersonalities:
          scentProfile.personalities,

        seoTitle:
          form.seoTitle.trim() ||
          undefined,

        seoDescription:
          form.seoDescription.trim() ||
          undefined,

        /*
         * Permanent Cloudinary URL
         * is now stored in Neon.
         */
        images:
          uploadedImage
            ? [
              {
                publicId:
                  uploadedImage.publicId,

                url:
                  uploadedImage.url,
              },
            ]
            : [],

        notes: {
          top:
            notes.top,

          heart:
            notes.heart,

          base:
            notes.base,
        },

        variants:
          variants.map(
            (variant) => {
              const sku =
                variant.sku
                  .trim()
                  .toUpperCase();

              return {
                size:
                  variant.size
                    .trim()
                    .toUpperCase(),

                price:
                  variant.price.trim(),

                stock:
                  variant.stock.trim(),

                ...(sku
                  ? {
                    sku,
                  }
                  : {}),
              };
            }
          ),
      };

      /* =============================================
         CREATE PRODUCT IN NEST / NEON
      ============================================== */

      const product =
        await productsService.create(
          payload
        );

      toast.success(
        form.status ===
          "Active"
          ? "Fragrance published."
          : "Draft saved.",
        {
          id: toastId,

          description:
            `${product.name} was saved successfully.`,
        }
      );

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      router.replace(
        `/admin/products/${product.id}`
      );

      router.refresh();
    } catch (error) {
      /*
       * If Cloudinary succeeded but creating
       * the Prisma Product failed, clean up
       * the unused Cloudinary upload.
       */

      if (
        uploadedImage?.publicId
      ) {
        try {
          await productsService.deleteImage(
            uploadedImage.publicId
          );
        } catch {
          /*
           * Preserve the original product
           * creation error.
           */
        }
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create product.",
        {
          id: toastId,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =======================================================
     UI
  ======================================================== */

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* Back */}

          <Link
            href="/admin/products"
            className="group inline-flex items-center gap-3 text-[9px] !text-[#806d66]"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
              strokeWidth={
                1.4
              }
            />

            Back to products
          </Link>

          {/* HEADER */}

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                Élan Parfums /
                Catalogue
              </p>

              <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                New fragrance.
              </h1>

              <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                Give it a name,
                tell its story and
                decide how it should
                appear in the
                collection.
              </p>
            </div>

            <StatusSelect
              value={
                form.status
              }
              disabled={
                isSubmitting
              }
              onChange={(
                value
              ) =>
                updateForm(
                  "status",
                  value
                )
              }
            />
          </div>

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
          >
            {/* LEFT */}

            <div className="space-y-5">
              {/* ESSENTIALS */}

              <Panel
                number="01"
                eyebrow="The essentials"
                title="Introduce the fragrance."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Product name"
                      value={
                        form.name
                      }
                      onChange={
                        handleNameChange
                      }
                      placeholder="e.g. Ambre Nocturne"
                      required
                      disabled={
                        isSubmitting
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Slug"
                      value={
                        form.slug
                      }
                      onChange={(
                        value
                      ) =>
                        updateForm(
                          "slug",
                          generateSlug(
                            value
                          )
                        )
                      }
                      placeholder="ambre-nocturne"
                      required
                      disabled={
                        isSubmitting
                      }
                    />

                    <p className="mt-2 text-[8px] !text-[#a18f88]">
                      /perfumes/
                      {form.slug ||
                        "your-fragrance"}
                    </p>
                  </div>

                  <SelectField
                    label="Fragrance family"
                    value={
                      form.family
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "family",
                        value
                      )
                    }
                    options={[
                      "Amber",
                      "Floral",
                      "Fresh",
                      "Woody",
                      "Gourmand",
                      "Leather",
                      "Citrus",
                      "Musk",
                    ]}
                  />

                  <SelectField
                    label="Concentration"
                    value={
                      form.concentration
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "concentration",
                        value
                      )
                    }
                    options={[
                      "Eau de parfum",
                      "Eau de toilette",
                      "Parfum",
                      "Extrait de parfum",
                    ]}
                  />

                  <SelectField
                    label="For"
                    value={
                      form.audience
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "audience",
                        value as Audience
                      )
                    }
                    options={[
                      "Women",
                      "Men",
                      "Unisex",
                    ]}
                  />

                  <Input
                    label="Badge"
                    value={
                      form.badge
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "badge",
                        value
                      )
                    }
                    placeholder="e.g. New arrival"
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </Panel>

              {/* STORY */}

              <Panel
                number="02"
                eyebrow="Give it a voice"
                title="Tell its story."
              >
                <div className="space-y-5">
                  <Textarea
                    label="Short description"
                    value={
                      form.shortDescription
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "shortDescription",
                        value
                      )
                    }
                    placeholder="A little warmth. A lasting impression."
                    maxLength={
                      150
                    }
                    required
                    disabled={
                      isSubmitting
                    }
                  />

                  <Textarea
                    label="Product story"
                    value={
                      form.story
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "story",
                        value
                      )
                    }
                    placeholder="Describe how the fragrance opens, develops and feels..."
                    rows={6}
                    maxLength={
                      3000
                    }
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </Panel>

              {/* VARIANTS */}

              <Panel
                number="03"
                eyebrow="Sizes & inventory"
                title="How will it be sold?"
              >
                <div className="space-y-3">
                  {variants.map(
                    (
                      variant,
                      index
                    ) => (
                      <VariantRow
                        key={
                          variant.id
                        }
                        variant={
                          variant
                        }
                        index={
                          index
                        }
                        disabled={
                          isSubmitting
                        }
                        removable={
                          variants.length >
                          1
                        }
                        onChange={(
                          key,
                          value
                        ) =>
                          updateVariant(
                            variant.id,
                            key,
                            value
                          )
                        }
                        onRemove={() =>
                          removeVariant(
                            variant.id
                          )
                        }
                      />
                    )
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    isSubmitting
                  }
                  onClick={
                    addVariant
                  }
                  className="group mt-5 inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add another size

                  <Plus
                    className="size-3 transition-transform group-hover:rotate-90"
                    strokeWidth={
                      1.4
                    }
                  />
                </button>
              </Panel>

              {/* NOTES */}

              <Panel
                number="04"
                eyebrow="Fragrance structure"
                title="Build the notes."
              >
                <div className="grid gap-5 lg:grid-cols-3">
                  <NoteEditor
                    title="Top notes"
                    description="The first impression."
                    value={
                      noteInputs.top
                    }
                    notes={
                      notes.top
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      setNoteInputs(
                        (
                          current
                        ) => ({
                          ...current,
                          top:
                            value,
                        })
                      )
                    }
                    onAdd={() =>
                      addNote(
                        "top"
                      )
                    }
                    onRemove={(
                      note
                    ) =>
                      removeNote(
                        "top",
                        note
                      )
                    }
                  />

                  <NoteEditor
                    title="Heart notes"
                    description="The character at its centre."
                    value={
                      noteInputs.heart
                    }
                    notes={
                      notes.heart
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      setNoteInputs(
                        (
                          current
                        ) => ({
                          ...current,
                          heart:
                            value,
                        })
                      )
                    }
                    onAdd={() =>
                      addNote(
                        "heart"
                      )
                    }
                    onRemove={(
                      note
                    ) =>
                      removeNote(
                        "heart",
                        note
                      )
                    }
                  />

                  <NoteEditor
                    title="Base notes"
                    description="What stays behind."
                    value={
                      noteInputs.base
                    }
                    notes={
                      notes.base
                    }
                    disabled={
                      isSubmitting
                    }
                    onChange={(
                      value
                    ) =>
                      setNoteInputs(
                        (
                          current
                        ) => ({
                          ...current,
                          base:
                            value,
                        })
                      )
                    }
                    onAdd={() =>
                      addNote(
                        "base"
                      )
                    }
                    onRemove={(
                      note
                    ) =>
                      removeNote(
                        "base",
                        note
                      )
                    }
                  />
                </div>
              </Panel>

              {/* CHARACTER */}

              <Panel
                number="05"
                eyebrow="How it wears"
                title="Give customers a feeling."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Feeling"
                    value={
                      form.feeling
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "feeling",
                        value
                      )
                    }
                    placeholder="Warm & seductive"
                    disabled={
                      isSubmitting
                    }
                  />

                  <Input
                    label="Longevity"
                    value={
                      form.longevity
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "longevity",
                        value
                      )
                    }
                    placeholder="7–9 hours"
                    disabled={
                      isSubmitting
                    }
                  />

                  <Input
                    label="Sillage"
                    value={
                      form.sillage
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "sillage",
                        value
                      )
                    }
                    placeholder="Moderate"
                    disabled={
                      isSubmitting
                    }
                  />

                  <Input
                    label="Season"
                    value={
                      form.season
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "season",
                        value
                      )
                    }
                    placeholder="Autumn · Winter"
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </Panel>

              <Panel
                number="06"
                eyebrow="Scent finder"
                title="Where should this fragrance appear?"
              >
                <ScentFinderProfileEditor
                  value={scentProfile}
                  onChange={setScentProfile}
                  disabled={isSubmitting}
                />
              </Panel>

              {/* SEO */}

              <Panel
                number="07"
                eyebrow="Search & sharing"
                title="Help people find it."
              >
                <div className="space-y-5">
                  <Input
                    label="SEO title"
                    value={
                      form.seoTitle
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "seoTitle",
                        value
                      )
                    }
                    placeholder="Ambre Nocturne | Élan Parfums"
                    disabled={
                      isSubmitting
                    }
                  />

                  <Textarea
                    label="SEO description"
                    value={
                      form.seoDescription
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "seoDescription",
                        value
                      )
                    }
                    placeholder="Short description for search engines and social sharing."
                    maxLength={
                      300
                    }
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </Panel>
            </div>

            {/* RIGHT */}

            <aside className="space-y-5 xl:sticky xl:top-[92px] xl:self-start">
              {/* IMAGE */}

              <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                      Product image
                    </p>

                    <h2 className="mt-2 font-display text-[25px] !text-[#382724]">
                      The first
                      impression.
                    </h2>
                  </div>

                  <ImagePlus
                    className="size-4 !text-[#9d8178]"
                    strokeWidth={
                      1.4
                    }
                  />
                </div>

                <div className="mt-5">
                  {imagePreview ? (
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe6e0]">
                      <Image
                        src={
                          imagePreview
                        }
                        alt={
                          form.name
                            ? `${form.name} preview`
                            : "Product preview"
                        }
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <button
                        type="button"
                        disabled={
                          isSubmitting
                        }
                        onClick={
                          removeImage
                        }
                        aria-label="Remove image"
                        className="absolute right-3 top-3 flex size-9 items-center justify-center bg-[#fbfaf7]/90 !text-[#6b2230] backdrop-blur disabled:opacity-50"
                      >
                        <Trash2
                          className="size-3.5"
                          strokeWidth={
                            1.4
                          }
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        flex
                        aspect-[4/5]
                        w-full
                        flex-col
                        items-center
                        justify-center
                        border
                        border-dashed
                        border-[#d3c8c1]
                        bg-[#f5f0ea]
                        px-8
                        text-center

                        transition-colors

                        hover:border-[#987167]
                        hover:bg-[#f2ebe5]

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span className="flex size-12 items-center justify-center rounded-full border border-[#d7cbc4] bg-[#fbfaf7]">
                        <Upload
                          className="size-4 !text-[#7d5f57]"
                          strokeWidth={
                            1.4
                          }
                        />
                      </span>

                      <p className="mt-5 text-[10px] font-medium !text-[#4c3934]">
                        Choose product
                        image
                      </p>

                      <p className="mt-2 max-w-[210px] text-[8px] leading-5 !text-[#9a8982]">
                        JPG, PNG or
                        WebP. Maximum
                        5 MB. A 4:5
                        image works
                        best.
                      </p>
                    </button>
                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={
                      isSubmitting
                    }
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />

                  {imageName && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-[8px] !text-[#88766f]">
                        {imageName}
                      </p>

                      <p className="shrink-0 text-[7px] uppercase tracking-[0.12em] !text-[#70816f]">
                        Ready to upload
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-[8px] leading-5 !text-[#a08e87]">
                    The image will be
                    uploaded securely
                    to Cloudinary when
                    you save this
                    fragrance.
                  </p>
                </div>
              </section>

              {/* SUMMARY */}

              <section className="border border-[#e5ddd3] bg-[#f1ece6] p-5">
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                  Product summary
                </p>

                <div className="mt-5 space-y-4">
                  <SummaryRow
                    label="Name"
                    value={
                      form.name ||
                      "Untitled fragrance"
                    }
                  />

                  <SummaryRow
                    label="Family"
                    value={
                      form.family
                    }
                  />

                  <SummaryRow
                    label="For"
                    value={
                      form.audience
                    }
                  />

                  <SummaryRow
                    label="Sizes"
                    value={String(
                      variants.length
                    )}
                  />

                  <SummaryRow
                    label="Total stock"
                    value={String(
                      totalStock
                    )}
                  />

                  <SummaryRow
                    label="Starting price"
                    value={
                      startingPrice !==
                        null
                        ? currency.format(
                          startingPrice
                        )
                        : "Not set"
                    }
                  />

                  <SummaryRow
                    label="Image"
                    value={
                      imageFile
                        ? "Selected"
                        : "None"
                    }
                  />

                  <SummaryRow
                    label="Scent occasions"
                    value={String(
                      scentProfile.occasions.length
                    )}
                  />

                  <SummaryRow
                    label="Scent moods"
                    value={String(
                      scentProfile.moods.length
                    )}
                  />

                  <SummaryRow
                    label="Scent personalities"
                    value={String(
                      scentProfile.personalities.length
                    )}
                  />

                  <SummaryRow
                    label="Status"
                    value={
                      form.status
                    }
                  />
                </div>
              </section>

              {/* SAVE */}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="
                    flex
                    min-h-[54px]
                    w-full
                    items-center
                    justify-between
                    bg-[#5a1425]
                    px-5
                    text-[10px]
                    font-medium
                    !text-white

                    transition-colors

                    hover:bg-[#6b1b2f]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {isSubmitting
                      ? form.status ===
                        "Active"
                        ? "Publishing..."
                        : "Saving..."
                      : form.status ===
                        "Active"
                        ? "Create & publish"
                        : "Save as draft"}
                  </span>

                  {isSubmitting ? (
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
                </button>

                <Link
                  href="/admin/products"
                  aria-disabled={
                    isSubmitting
                  }
                  className={`flex min-h-[46px] w-full items-center justify-center border border-[#d8d0ca] text-[9px] !text-[#70605a] ${isSubmitting
                    ? "pointer-events-none opacity-50"
                    : ""
                    }`}
                >
                  Cancel
                </Link>
              </div>

              <p className="text-[8px] leading-5 !text-[#9a8982]">
                Product media is
                stored with Cloudinary.
                Product data,
                variants and opening
                stock are persisted
                through NestJS and
                Neon.
              </p>
            </aside>
          </form>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CURRENCY
========================================================= */

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits:
        0,
      maximumFractionDigits:
        0,
    }
  );

/* =========================================================
   PANEL
========================================================= */

function Panel({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-[45px_1fr]">
        <p className="text-[8px] !text-[#aa897d]">
          {number}
        </p>

        <div>
          <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
            {eyebrow}
          </p>

          <h2 className="mt-2 font-display text-[27px] font-normal !text-[#382724]">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-7 sm:pl-[45px]">
        {children}
      </div>
    </motion.section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] font-medium !text-[#806e67]">
        {label}
      </span>

      <input
        type="text"
        value={value}
        required={required}
        disabled={disabled}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-[50px]
          w-full
          border
          border-[#d8d0ca]
          bg-transparent
          px-4
          text-[10px]
          !text-[#3b2c28]
          outline-none

          placeholder:!text-[#aaa09b]

          transition-colors

          focus:border-[#7e4c55]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />
    </label>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[8px] font-medium !text-[#806e67]">
          {label}
        </span>

        {maxLength && (
          <span className="text-[8px] !text-[#a39189]">
            {value.length}/
            {maxLength}
          </span>
        )}
      </div>

      <textarea
        value={value}
        rows={rows}
        required={required}
        maxLength={
          maxLength
        }
        disabled={disabled}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          w-full
          resize-none
          border
          border-[#d8d0ca]
          bg-transparent
          px-4
          py-3
          text-[10px]
          leading-6
          !text-[#3b2c28]
          outline-none

          placeholder:!text-[#aaa09b]

          focus:border-[#7e4c55]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />
    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] font-medium !text-[#806e67]">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-[50px]
            w-full
            appearance-none
            border
            border-[#d8d0ca]
            bg-transparent
            px-4
            pr-10
            text-[10px]
            !text-[#3b2c28]
            outline-none

            focus:border-[#7e4c55]

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {options.map(
            (option) => (
              <option
                key={
                  option
                }
                value={
                  option
                }
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 !text-[#66554f]"
          strokeWidth={1.4}
        />
      </div>
    </label>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: ProductStatus;
  onChange: (
    value: ProductStatus
  ) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-fit border border-[#d8d0ca] bg-[#fbfaf7] p-1">
      {(
        [
          "Draft",
          "Active",
        ] as const
      ).map((status) => {
        const active =
          value === status;

        return (
          <button
            key={status}
            type="button"
            disabled={
              disabled
            }
            onClick={() =>
              onChange(
                status
              )
            }
            className={`
              flex
              min-h-[38px]
              items-center
              gap-2
              px-4
              text-[8px]
              font-medium
              uppercase
              tracking-[0.12em]

              transition-all

              disabled:cursor-not-allowed
              disabled:opacity-50

              ${active
                ? "bg-[#5a1425] !text-white"
                : "!text-[#86736d]"
              }
            `}
          >
            {active && (
              <Check
                className="size-2.5"
                strokeWidth={2}
              />
            )}

            {status}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   VARIANT
========================================================= */

function VariantRow({
  variant,
  index,
  removable,
  onChange,
  onRemove,
  disabled,
}: {
  variant: ProductVariant;
  index: number;
  removable: boolean;

  onChange: (
    key: keyof Omit<
      ProductVariant,
      "id"
    >,
    value: string
  ) => void;

  onRemove: () => void;

  disabled?: boolean;
}) {
  return (
    <div className="border border-[#e2dad4] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[8px] font-medium uppercase tracking-[0.16em] !text-[#927b73]">
          Variant {index + 1}
        </p>

        {removable && (
          <button
            type="button"
            disabled={
              disabled
            }
            onClick={
              onRemove
            }
            aria-label={`Remove variant ${index + 1
              }`}
            className="flex size-7 items-center justify-center !text-[#9d6a62] hover:bg-[#f4e9e6] disabled:opacity-50"
          >
            <Trash2
              className="size-3"
              strokeWidth={
                1.4
              }
            />
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SmallInput
          label="Size"
          value={
            variant.size
          }
          disabled={
            disabled
          }
          onChange={(
            value
          ) =>
            onChange(
              "size",
              value
            )
          }
          placeholder="50 ML"
        />

        <SmallInput
          label="Price"
          type="number"
          step="0.01"
          value={
            variant.price
          }
          disabled={
            disabled
          }
          onChange={(
            value
          ) =>
            onChange(
              "price",
              value
            )
          }
          placeholder="1450"
        />

        <SmallInput
          label="Stock"
          type="number"
          step="1"
          value={
            variant.stock
          }
          disabled={
            disabled
          }
          onChange={(
            value
          ) =>
            onChange(
              "stock",
              value
            )
          }
          placeholder="10"
        />

        <SmallInput
          label="SKU"
          value={
            variant.sku
          }
          disabled={
            disabled
          }
          onChange={(
            value
          ) =>
            onChange(
              "sku",
              value
            )
          }
          placeholder="ELAN-AM-50"
        />
      </div>
    </div>
  );
}

/* =========================================================
   SMALL INPUT
========================================================= */

function SmallInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  disabled,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;
  type?: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-[8px] !text-[#8d7972]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        step={step}
        disabled={
          disabled
        }
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-[44px] w-full border border-[#ddd4ce] bg-transparent px-3 text-[9px] !text-[#42332e] outline-none focus:border-[#7e4c55] disabled:opacity-60"
      />
    </label>
  );
}

/* =========================================================
   NOTES
========================================================= */

function NoteEditor({
  title,
  description,
  value,
  notes,
  onChange,
  onAdd,
  onRemove,
  disabled,
}: {
  title: string;
  description: string;
  value: string;
  notes: string[];

  onChange: (
    value: string
  ) => void;

  onAdd: () => void;

  onRemove: (
    note: string
  ) => void;

  disabled?: boolean;
}) {
  return (
    <div className="border-t border-[#ded6cf] pt-5">
      <h3 className="font-display text-[20px] !text-[#3c2c28]">
        {title}
      </h3>

      <p className="mt-2 text-[8px] !text-[#9a8982]">
        {description}
      </p>

      <div className="mt-4 flex">
        <input
          value={value}
          disabled={
            disabled
          }
          placeholder="Add note"
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.preventDefault();

              if (
                !disabled
              ) {
                onAdd();
              }
            }
          }}
          className="h-[42px] min-w-0 flex-1 border border-[#ddd4ce] bg-transparent px-3 text-[9px] outline-none focus:border-[#7e4c55] disabled:opacity-60"
        />

        <button
          type="button"
          disabled={
            disabled
          }
          onClick={
            onAdd
          }
          className="flex size-[42px] items-center justify-center bg-[#5a1425] !text-white disabled:opacity-50"
        >
          <Plus
            className="size-3.5"
            strokeWidth={
              1.4
            }
          />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {notes.map(
          (note) => (
            <span
              key={note}
              className="inline-flex items-center gap-2 bg-[#f0ebe5] px-3 py-2 text-[8px] !text-[#5a4640]"
            >
              {note}

              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={() =>
                  onRemove(
                    note
                  )
                }
                aria-label={`Remove ${note}`}
              >
                <X
                  className="size-2.5"
                  strokeWidth={
                    1.5
                  }
                />
              </button>
            </span>
          )
        )}

        {notes.length ===
          0 && (
            <p className="text-[8px] !text-[#b09f98]">
              No notes added yet.
            </p>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#dad0c9] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[8px] !text-[#8e7a73]">
        {label}
      </span>

      <span className="max-w-[190px] text-right text-[9px] font-medium !text-[#41312d]">
        {value}
      </span>
    </div>
  );
}