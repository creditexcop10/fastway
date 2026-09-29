import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BrandedPreloader } from "@/components/shared/BrandedPreloader";
import { Toaster } from "sonner"; // <-- Import Toaster

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Fastway Send | 24/7 Courier & Logistics",
  description: "Global supplier of transport and logistics solutions. Fast, secure, and on-time delivery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <BrandedPreloader />
        {children}
        <Toaster richColors position="top-right" /> {/* <-- Add Toaster here */}
      </body>
    </html>
  );
}