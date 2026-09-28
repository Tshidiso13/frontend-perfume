"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ScentFinderProfileEditor,
} from "@/components/admin/products/scent-finder-profile-editor";

import type {
  ScentProfileValue,
} from "@/lib/scent-finder-options";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  productsService,
  type Product,
  type ProductImage,
  type UploadedProductImage,
} from "@/services/products.service";

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

type EditableVariant = {
  localId: string;
  backendId?: string;

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

type PendingImage = {
  id: string;
  file: File;
  preview: string;
};

/* =========================================================
   INITIAL FORM
========================================================= */

const emptyForm: ProductForm = {
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

/* =========================================================
   COMPONENT
========================================================= */

export function AdminEditProductPage({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>(
      emptyForm
    );

  const [variants, setVariants] =
    useState<EditableVariant[]>(
      []
    );

  const [notes, setNotes] =
    useState<NoteGroup>({
      top: [],
      heart: [],
      base: [],
    });

  const [
    scentProfile,
    setScentProfile,
  ] = useState<ScentProfileValue>({
    occasions: [],
    moods: [],
    personalities: [],
  });

  const [
    noteInputs,
    setNoteInputs,
  ] = useState({
    top: "",
    heart: "",
    base: "",
  });

  /*
   * Existing permanent URLs
   * already stored in Neon.
   */
  const [
    existingImages,
    setExistingImages,
  ] = useState<
    ProductImage[]
  >([]);

  /*
   * New files selected from computer.
   * These are uploaded to Cloudinary
   * only when Save changes is pressed.
   */
  const [
    pendingImages,
    setPendingImages,
  ] = useState<PendingImage[]>(
    []
  );

  const pendingImagesRef =
    useRef<PendingImage[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  /* =======================================================
     LOCAL PREVIEW CLEANUP
  ======================================================== */

  useEffect(() => {
    pendingImagesRef.current =
      pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview
          );
        }
      );
    };
  }, []);

  /* =======================================================
     LOAD PRODUCT
  ======================================================== */

  const loadProduct =
    useCallback(async () => {
      if (!productId) {
        setError(
          "Product ID is missing."
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await productsService.getAdminProduct(
            productId
          );

        setProduct(result);

        setForm({
          name:
            result.name ?? "",

          slug:
            result.slug ?? "",

          shortDescription:
            result.shortDescription ??
            "",



          story:
            result.story ?? "",

          family:
            result.family ??
            "Amber",

          concentration:
            result.concentration ??
            "Eau de parfum",

          audience:
            mapAudienceToForm(
              result.audience
            ),

          badge:
            result.badge ?? "",

          status:
            result.status ===
              "ACTIVE"
              ? "Active"
              : "Draft",

          feeling:
            result.feeling ?? "",

          longevity:
            result.longevity ?? "",

          sillage:
            result.sillage ?? "",

          season:
            result.season ?? "",

          seoTitle:
            result.seoTitle ?? "",

          seoDescription:
            result.seoDescription ??
            "",
        });

        setScentProfile({
          occasions:
            result.scentOccasions ?? [],

          moods:
            result.scentMoods ?? [],

          personalities:
            result.scentPersonalities ?? [],
        });

        setVariants(
          result.variants.map(
            (variant) => ({
              localId:
                variant.id,

              backendId:
                variant.id,

              size:
                variant.size,

              price:
                String(
                  variant.price
                ),

              stock:
                String(
                  variant.stock
                ),

              sku:
                variant.sku,
            })
          )
        );

        setNotes({
          top:
            result.topNotes ?? [],

          heart:
            result.heartNotes ??
            [],

          base:
            result.baseNotes ?? [],
        });

        setExistingImages(
          result.images ?? []
        );

        /*
         * Remove any unsaved local
         * images when refreshing.
         */
        setPendingImages(
          (current) => {
            current.forEach(
              (image) =>
                URL.revokeObjectURL(
                  image.preview
                )
            );

            return [];
          }
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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

          return (
            total +
            (Number.isFinite(
              stock
            )
              ? stock
              : 0)
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

  const imageCount =
    existingImages.length +
    pendingImages.length;

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
      .trim()
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
      const previousAutomaticTitle =
        current.name
          ? `${current.name} | Élan Parfums`
          : "";

      const shouldUpdateSeo =
        !current.seoTitle ||
        current.seoTitle ===
        previousAutomaticTitle;

      return {
        ...current,

        name: value,

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
    localId: string,
    key:
      | "size"
      | "price"
      | "stock"
      | "sku",
    value: string
  ) {
    setVariants(
      (current) =>
        current.map(
          (variant) =>
            variant.localId ===
              localId
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
          localId:
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
    localId: string
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
            variant.localId !==
            localId
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
     PRODUCT IMAGES
  ======================================================== */

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (
      files.length === 0
    ) {
      return;
    }

    const remainingSlots =
      10 - imageCount;

    if (
      remainingSlots <= 0
    ) {
      toast.error(
        "A product can have a maximum of 10 images."
      );

      event.target.value = "";

      return;
    }

    const selectedFiles =
      files.slice(
        0,
        remainingSlots
      );

    const validImages:
      PendingImage[] = [];

    for (
      const file of
      selectedFiles
    ) {
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
          `${file.name}: only JPG, PNG and WebP are allowed.`
        );

        continue;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        toast.error(
          `${file.name}: image must be smaller than 5 MB.`
        );

        continue;
      }

      validImages.push({
        id:
          crypto.randomUUID(),

        file,

        preview:
          URL.createObjectURL(
            file
          ),
      });
    }

    if (
      validImages.length >
      0
    ) {
      setPendingImages(
        (current) => [
          ...current,
          ...validImages,
        ]
      );
    }

    /*
     * Allows selecting the same
     * file again later.
     */
    event.target.value = "";
  }

  async function removeExistingImage(
    imageId: string
  ) {
    if (saving) {
      return;
    }

    const currentImage =
      existingImages.find(
        (image) =>
          image.id === imageId
      );

    if (!currentImage) {
      return;
    }

    const toastId =
      toast.loading(
        "Removing image..."
      );

    try {
      await productsService.deleteProductImage(
        productId,
        imageId
      );

      setExistingImages(
        (current) =>
          current.filter(
            (image) =>
              image.id !==
              imageId
          )
      );

      toast.success(
        "Image removed.",
        {
          id: toastId,
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove image.",
        {
          id: toastId,
        }
      );
    }
  }

  function removePendingImage(
    id: string
  ) {
    setPendingImages(
      (current) => {
        const image =
          current.find(
            (item) =>
              item.id === id
          );

        if (image) {
          URL.revokeObjectURL(
            image.preview
          );
        }

        return current.filter(
          (item) =>
            item.id !== id
        );
      }
    );
  }

  /* =======================================================
     SAVE
  ======================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
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
        "Enter a valid product name."
      );

      return;
    }

    if (!slug) {
      toast.error(
        "Enter a valid product slug."
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
        "Add at least one product variant."
      );

      return;
    }

    /* =============================================
       VALIDATE VARIANTS
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
       DUPLICATE SIZE CHECK
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
       DUPLICATE SKU CHECK
    ============================================== */

    const skus =
      variants
        .map(
          (variant) =>
            variant.sku
              .trim()
              .toUpperCase()
        )
        .filter(Boolean);

    if (
      new Set(skus).size !==
      skus.length
    ) {
      toast.error(
        "Each variant must have a unique SKU."
      );

      return;
    }

    setSaving(true);

    const toastId =
      toast.loading(
        "Saving product changes..."
      );

    /*
     * uploadedImages tracks raw Cloudinary uploads.
     * attachedImages tracks ProductImage rows created
     * in Neon. If saving fails, both can be cleaned up
     * without leaving orphaned assets or DB records.
     */
    const uploadedImages:
      UploadedProductImage[] =
      [];

    const attachedImages:
      ProductImage[] =
      [];

    try {
      /* =============================================
         UPLOAD NEW FILES TO CLOUDINARY + ATTACH
      ============================================== */

      if (
        pendingImages.length >
        0
      ) {
        for (
          let index = 0;
          index <
          pendingImages.length;
          index++
        ) {
          const image =
            pendingImages[index];

          toast.loading(
            `Uploading image ${index + 1
            } of ${pendingImages.length
            }...`,
            {
              id: toastId,
            }
          );

          const uploaded =
            await productsService.uploadImage(
              image.file
            );

          uploadedImages.push(
            uploaded
          );

          const savedImage =
            await productsService.addProductImage(
              productId,
              {
                publicId:
                  uploaded.publicId,

                url:
                  uploaded.url,
              }
            );

          attachedImages.push(
            savedImage
          );
        }
      }

      toast.loading(
        "Updating fragrance...",
        {
          id: toastId,
        }
      );

      /* =============================================
         UPDATE PRODUCT DATA

         Images are NOT sent here anymore.
         ProductImage has dedicated endpoints.
      ============================================== */

      const payload = {
        name,

        slug,

        shortDescription,

        story:
          form.story.trim() ||
          undefined,

        family:
          form.family.trim(),

        scentOccasions:
          scentProfile.occasions,

        scentMoods:
          scentProfile.moods,

        scentPersonalities:
          scentProfile.personalities,

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

        seoTitle:
          form.seoTitle.trim() ||
          undefined,

        seoDescription:
          form.seoDescription.trim() ||
          undefined,

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
                ...(variant.backendId
                  ? {
                    id:
                      variant.backendId,
                  }
                  : {}),

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

      const updatedProduct =
        await productsService.update(
          productId,
          payload
        );

      /* =============================================
         CLEAN LOCAL PREVIEWS
      ============================================== */

      pendingImages.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview
          );
        }
      );

      setPendingImages([]);

      setExistingImages(
        updatedProduct.images ??
        []
      );

      setProduct(
        updatedProduct
      );

      toast.success(
        "Product updated.",
        {
          id: toastId,

          description:
            `${updatedProduct.name} has been saved successfully.`,
        }
      );

      router.replace(
        `/admin/products/${updatedProduct.id}`
      );

      router.refresh();
    } catch (error) {
      /* =============================================
         ROLLBACK ATTACHED PRODUCT IMAGES

         deleteProductImage removes both the Neon row
         and the corresponding Cloudinary asset.
      ============================================== */

      if (
        attachedImages.length >
        0
      ) {
        await Promise.allSettled(
          attachedImages.map(
            (image) =>
              productsService.deleteProductImage(
                productId,
                image.id
              )
          )
        );
      }

      /* =============================================
         CLEAN RAW CLOUDINARY UPLOADS THAT WERE NEVER
         ATTACHED TO A ProductImage ROW
      ============================================== */

      const attachedPublicIds =
        new Set(
          attachedImages.map(
            (image) =>
              image.publicId
          )
        );

      const unattachedUploads =
        uploadedImages.filter(
          (image) =>
            !attachedPublicIds.has(
              image.publicId
            )
        );

      if (
        unattachedUploads.length >
        0
      ) {
        await Promise.allSettled(
          unattachedUploads.map(
            (image) =>
              productsService.deleteImage(
                image.publicId
              )
          )
        );
      }

      /*
       * Re-fetch in case part of the image workflow
       * completed before the request failed.
       */
      try {
        await loadProduct();
      } catch {
        // Preserve the original save error.
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update product.",
        {
          id: toastId,
        }
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <PageState>
        <LoaderCircle
          className="size-5 animate-spin !text-[#5a1425]"
          strokeWidth={1.4}
        />

        <p className="mt-4 text-[9px] !text-[#8a7770]">
          Loading fragrance...
        </p>
      </PageState>
    );
  }

  /* =======================================================
     ERROR
  ======================================================== */

  if (
    error ||
    !product
  ) {
    return (
      <PageState>
        <AlertTriangle
          className="size-5 !text-[#9a5f57]"
          strokeWidth={1.4}
        />

        <p className="mt-5 text-[8px] font-medium uppercase tracking-[0.2em] !text-[#a06a60]">
          Product unavailable
        </p>

        <h1 className="mt-3 font-display text-[34px] !text-[#382724]">
          We couldn&apos;t load
          this fragrance.
        </h1>

        <p className="mt-3 max-w-md text-[9px] leading-5 !text-[#88766f]">
          {error ??
            "Product not found."}
        </p>

        <button
          type="button"
          onClick={
            loadProduct
          }
          className="mt-6 inline-flex items-center gap-2 bg-[#5a1425] px-5 py-3 text-[9px] !text-white"
        >
          <RefreshCcw
            className="size-3"
            strokeWidth={1.4}
          />

          Try again
        </button>
      </PageState>
    );
  }

  /* =======================================================
     UI
  ======================================================== */

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* BACK */}

          <Link
            href={`/admin/products/${productId}`}
            className="group inline-flex items-center gap-3 text-[9px] !text-[#806d66]"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-1"
              strokeWidth={1.4}
            />

            Back to product
          </Link>

          {/* HEADER */}

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                Élan Parfums /
                Catalogue
              </p>

              <h1 className="mt-4 font-display text-[44px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                Edit fragrance.
              </h1>

              <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69]">
                Update product
                information, images,
                variants, pricing and
                inventory.
              </p>

              <p className="mt-3 text-[8px] uppercase tracking-[0.14em] !text-[#a18d85]">
                Product ID ·{" "}
                {product.id}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusSelect
                value={
                  form.status
                }
                disabled={
                  saving
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

              {product.status ===
                "ACTIVE" && (
                  <Link
                    href={`/perfumes/${product.slug}`}
                    target="_blank"
                    className="inline-flex min-h-[46px] items-center gap-3 border border-[#d8d0ca] px-4 text-[8px] font-medium !text-[#67554f]"
                  >
                    Storefront

                    <ExternalLink
                      className="size-3"
                      strokeWidth={
                        1.4
                      }
                    />
                  </Link>
                )}
            </div>
          </div>

          {product.status ===
            "ARCHIVED" && (
              <div className="mt-7 flex gap-4 border border-[#ead6d2] bg-[#f8efec] p-5">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 !text-[#9b5a51]"
                  strokeWidth={
                    1.4
                  }
                />

                <div>
                  <p className="text-[9px] font-medium !text-[#71433d]">
                    This product is
                    archived.
                  </p>

                  <p className="mt-2 text-[8px] leading-5 !text-[#8d6962]">
                    Change its status to
                    Draft or Active and
                    save to restore it.
                  </p>
                </div>
              </div>
            )}

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
          >
            {/* LEFT */}

            <div className="space-y-5">
              <Panel
                number="01"
                eyebrow="The essentials"
                title="Product identity."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Product name"
                      value={
                        form.name
                      }
                      disabled={
                        saving
                      }
                      onChange={
                        handleNameChange
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Slug"
                      value={
                        form.slug
                      }
                      disabled={
                        saving
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
                    />

                    <p className="mt-2 text-[8px] !text-[#a18f88]">
                      /perfumes/
                      {form.slug}
                    </p>
                  </div>

                  <SelectField
                    label="Fragrance family"
                    value={
                      form.family
                    }
                    disabled={
                      saving
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
                      saving
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
                      saving
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
                    disabled={
                      saving
                    }
                    placeholder="New arrival"
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "badge",
                        value
                      )
                    }
                  />
                </div>
              </Panel>

              <Panel
                number="02"
                eyebrow="The story"
                title="Describe the fragrance."
              >
                <div className="space-y-5">
                  <Textarea
                    label="Short description"
                    value={
                      form.shortDescription
                    }
                    disabled={
                      saving
                    }
                    maxLength={
                      150
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "shortDescription",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="Product story"
                    value={
                      form.story
                    }
                    disabled={
                      saving
                    }
                    rows={6}
                    maxLength={
                      3000
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "story",
                        value
                      )
                    }
                  />
                </div>
              </Panel>

              {/* VARIANTS */}

              <Panel
                number="03"
                eyebrow="Sizes & inventory"
                title="Variants."
              >
                <div className="space-y-3">
                  {variants.map(
                    (
                      variant,
                      index
                    ) => (
                      <VariantRow
                        key={
                          variant.localId
                        }
                        variant={
                          variant
                        }
                        index={
                          index
                        }
                        disabled={
                          saving
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
                            variant.localId,
                            key,
                            value
                          )
                        }
                        onRemove={() =>
                          removeVariant(
                            variant.localId
                          )
                        }
                      />
                    )
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    addVariant
                  }
                  className="group mt-5 inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425] disabled:opacity-50"
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
                title="Notes."
              >
                <div className="grid gap-5 lg:grid-cols-3">
                  <NoteEditor
                    title="Top notes"
                    description="The first impression."
                    notes={
                      notes.top
                    }
                    value={
                      noteInputs.top
                    }
                    disabled={
                      saving
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
                    notes={
                      notes.heart
                    }
                    value={
                      noteInputs.heart
                    }
                    disabled={
                      saving
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
                    notes={
                      notes.base
                    }
                    value={
                      noteInputs.base
                    }
                    disabled={
                      saving
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
                title="Character."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Feeling"
                    value={
                      form.feeling
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "feeling",
                        value
                      )
                    }
                  />

                  <Input
                    label="Longevity"
                    value={
                      form.longevity
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "longevity",
                        value
                      )
                    }
                  />

                  <Input
                    label="Sillage"
                    value={
                      form.sillage
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "sillage",
                        value
                      )
                    }
                  />

                  <Input
                    label="Season"
                    value={
                      form.season
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "season",
                        value
                      )
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
                  disabled={saving}
                />
              </Panel>

              {/* SEO */}

              <Panel
                number="07"
                eyebrow="Search & sharing"
                title="SEO."
              >
                <div className="space-y-5">
                  <Input
                    label="SEO title"
                    value={
                      form.seoTitle
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "seoTitle",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="SEO description"
                    value={
                      form.seoDescription
                    }
                    disabled={
                      saving
                    }
                    maxLength={
                      300
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "seoDescription",
                        value
                      )
                    }
                  />
                </div>
              </Panel>
            </div>

            {/* RIGHT */}

            <aside className="space-y-5 xl:sticky xl:top-[92px] xl:self-start">
              {/* PRODUCT IMAGES */}

              <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                      Product images
                    </p>

                    <h2 className="mt-2 font-display text-[25px] !text-[#382724]">
                      Catalogue media.
                    </h2>
                  </div>

                  <ImagePlus
                    className="size-4 !text-[#9d8178]"
                    strokeWidth={
                      1.4
                    }
                  />
                </div>

                {/* EXISTING IMAGES */}

                {existingImages.length >
                  0 && (
                    <div className="mt-5">
                      <p className="mb-3 text-[8px] uppercase tracking-[0.14em] !text-[#927e76]">
                        Saved images
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {existingImages.map(
                          (
                            image,
                            index
                          ) => (
                            <div
                              key={image.id}
                              className="relative"
                            >
                              <img
                                src={image.url}
                                alt={`${form.name} ${index + 1
                                  }`}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeExistingImage(
                                    image.id
                                  )
                                }
                              >
                                <Trash2 />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* NEW FILES */}

                {pendingImages.length >
                  0 && (
                    <div className="mt-5">
                      <p className="mb-3 text-[8px] uppercase tracking-[0.14em] !text-[#927e76]">
                        New images
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {pendingImages.map(
                          (
                            image,
                            index
                          ) => (
                            <div
                              key={
                                image.id
                              }
                              className="group relative aspect-[4/5] overflow-hidden bg-[#eee9e3]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  image.preview
                                }
                                alt={`New product image ${index + 1
                                  }`}
                                className="h-full w-full object-cover"
                              />

                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  removePendingImage(
                                    image.id
                                  )
                                }
                                aria-label="Remove selected image"
                                className="absolute right-2 top-2 flex size-8 items-center justify-center bg-[#fbfaf7]/95 !text-[#8d4646] backdrop-blur"
                              >
                                <X
                                  className="size-3"
                                  strokeWidth={
                                    1.5
                                  }
                                />
                              </button>

                              <span className="absolute bottom-2 left-2 bg-[#e8eee8]/95 px-2 py-1 text-[7px] uppercase tracking-[0.1em] !text-[#526357]">
                                Ready
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* UPLOAD BUTTON */}

                <button
                  type="button"
                  disabled={
                    saving ||
                    imageCount >= 10
                  }
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                  className="
                    mt-5
                    flex
                    min-h-[52px]
                    w-full
                    items-center
                    justify-between
                    border
                    border-dashed
                    border-[#cfc3bc]
                    bg-[#f5f0ea]
                    px-4
                    text-[9px]
                    font-medium
                    !text-[#5c4943]

                    transition-colors

                    hover:border-[#956c63]
                    hover:bg-[#f1e9e3]

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <span>
                    {imageCount >= 10
                      ? "Maximum 10 images"
                      : "Upload images"}
                  </span>

                  <Upload
                    className="size-3.5"
                    strokeWidth={
                      1.4
                    }
                  />
                </button>

                <input
                  ref={
                    imageInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={
                    saving
                  }
                  onChange={
                    handleImageSelect
                  }
                  className="hidden"
                />

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[8px] leading-5 !text-[#9a8982]">
                    JPG, PNG or WebP.
                    Maximum 5 MB each.
                  </p>

                  <p className="text-[8px] !text-[#806d66]">
                    {imageCount}/10
                  </p>
                </div>

                <p className="mt-2 text-[8px] leading-5 !text-[#9a8982]">
                  New files are
                  uploaded to Cloudinary
                  when you save the
                  fragrance.
                </p>
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
                      "Untitled"
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
                    label="Variants"
                    value={String(
                      variants.length
                    )}
                  />

                  <SummaryRow
                    label="Stock"
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
                    label="Images"
                    value={String(
                      imageCount
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
                    saving
                  }
                  className="flex min-h-[54px] w-full items-center justify-between bg-[#5a1425] px-5 text-[10px] font-medium !text-white transition-colors hover:bg-[#6b1b2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {saving
                      ? pendingImages.length >
                        0
                        ? "Uploading & saving..."
                        : "Saving changes..."
                      : "Save changes"}
                  </span>

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
                </button>

                <Link
                  href={`/admin/products/${productId}`}
                  className={`flex min-h-[46px] w-full items-center justify-center border border-[#d8d0ca] text-[9px] !text-[#70605a] ${saving
                    ? "pointer-events-none opacity-50"
                    : ""
                    }`}
                >
                  Cancel
                </Link>
              </div>

              <p className="text-[8px] leading-5 !text-[#9a8982]">
                Product images are
                uploaded through
                NestJS to Cloudinary.
                Product data and
                inventory are stored
                in Neon.
              </p>
            </aside>
          </form>
        </div>
      </div>
    </section>
  );
}

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
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
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

          <h2 className="mt-2 font-display text-[27px] !text-[#382724]">
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
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
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
        disabled={disabled}
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="h-[50px] w-full border border-[#d8d0ca] bg-transparent px-4 text-[10px] !text-[#3b2c28] outline-none placeholder:!text-[#aaa09b] focus:border-[#7e4c55] disabled:opacity-60"
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
  rows = 4,
  maxLength,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  rows?: number;
  maxLength?: number;
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
        maxLength={
          maxLength
        }
        disabled={disabled}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full resize-none border border-[#d8d0ca] bg-transparent px-4 py-3 text-[10px] leading-6 !text-[#3b2c28] outline-none focus:border-[#7e4c55] disabled:opacity-60"
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
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="h-[50px] w-full appearance-none border border-[#d8d0ca] bg-transparent px-4 pr-10 text-[10px] !text-[#3b2c28] outline-none focus:border-[#7e4c55] disabled:opacity-60"
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
            className={`flex min-h-[38px] items-center gap-2 px-4 text-[8px] font-medium uppercase tracking-[0.12em] ${active
              ? "bg-[#5a1425] !text-white"
              : "!text-[#86736d]"
              } disabled:opacity-50`}
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
  disabled,
  onChange,
  onRemove,
}: {
  variant: EditableVariant;
  index: number;
  removable: boolean;
  disabled?: boolean;

  onChange: (
    key:
      | "size"
      | "price"
      | "stock"
      | "sku",
    value: string
  ) => void;

  onRemove: () => void;
}) {
  return (
    <div className="border border-[#e2dad4] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-[0.16em] !text-[#927b73]">
            Variant {index + 1}
          </p>

          <p className="mt-1 text-[7px] !text-[#aa9992]">
            {variant.backendId
              ? "Existing variant"
              : "New variant"}
          </p>
        </div>

        {removable && (
          <button
            type="button"
            disabled={
              disabled
            }
            onClick={
              onRemove
            }
            className="flex size-7 items-center justify-center !text-[#9d6a62] hover:bg-[#f4e9e6] disabled:opacity-40"
          >
            <Trash2
              className="size-3"
              strokeWidth={1.4}
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
        />
      </div>
    </div>
  );
}

function SmallInput({
  label,
  value,
  onChange,
  type = "text",
  step,
  disabled,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

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
        disabled={disabled}
        onChange={(
          event
        ) =>
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
  disabled,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  value: string;
  notes: string[];
  disabled?: boolean;

  onChange: (
    value: string
  ) => void;

  onAdd: () => void;

  onRemove: (
    note: string
  ) => void;
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
          disabled={disabled}
          placeholder="Add note"
          onChange={(
            event
          ) =>
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

              if (!disabled) {
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
            strokeWidth={1.4}
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
              No notes added.
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

/* =========================================================
   PAGE STATE
========================================================= */

function PageState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center">
      {children}
    </section>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function mapAudienceToForm(
  audience:
    | "WOMEN"
    | "MEN"
    | "UNISEX"
): Audience {
  if (
    audience === "WOMEN"
  ) {
    return "Women";
  }

  if (
    audience === "MEN"
  ) {
    return "Men";
  }

  return "Unisex";
}

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