import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({
  children,
}: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />

      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}