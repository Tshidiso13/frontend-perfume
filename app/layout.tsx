import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppToaster } from "@/components/providers/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "Élan Parfums | Find Your Signature Scent",
    template: "%s | Élan Parfums",
  },

  description:
    "Discover fragrances made for everyday moments, unforgettable nights and everything in between.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f6f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <div id="main-content" className="app-root">
          {children}
        </div>
        <AppToaster />
      </body>
    </html>
  );
}