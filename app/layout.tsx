import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hannah OnlyFans — Exclusive Content",
  description:
    "Join Hannah's exclusive OnlyFans. Premium content, 7 days access, one payment. ₱280 only.",
  keywords: ["exclusive content", "premium", "hannah", "7 days access", "onlyfans"],
  openGraph: {
    title: "Hannah OnlyFans — Exclusive Content",
    description: "Premium exclusive content. 7 days access for ₱280.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
