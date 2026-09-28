export const siteConfig = {
  name: "Élan Parfums",

  description:
    "Discover fragrances made for everyday moments, unforgettable nights and everything in between.",

  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  links: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },

  contact: {
    email: "",
    phone: "",
  },
} as const;