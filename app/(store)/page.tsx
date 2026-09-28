import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Package,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { FeaturedFragrances } from "@/components/home/featured-fragrances";
import { Hero } from "@/components/home/hero";
import { MoodSection } from "@/components/home/mood-section";
import { EditorialSplit } from "@/components/home/editorial-split";
import { QuoteSection } from "@/components/home/quote";



export default function HomePage() {
  return (
    <div className="bg-[#fbfaf7]">
      {/* HERO */}
      <Hero />

      <FeaturedFragrances />

  

      {/* MOOD */}
      <MoodSection />

      {/* EDITORIAL SPLIT */}
      <EditorialSplit />
      {/* QUOTE */}
      <QuoteSection />
    </div>
  );
}



