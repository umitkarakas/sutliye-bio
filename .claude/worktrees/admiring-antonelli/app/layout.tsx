import type { Metadata } from "next";
import { getPublicBusiness } from "@/lib/server/public-data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const business = await getPublicBusiness();
  const title = business.seoTitle || business.name;
  const description = business.seoDescription || business.tagline;

  return {
    title,
    description,
    openGraph: {
      title,
      description
    },
    twitter: {
      title,
      description,
      card: "summary"
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
