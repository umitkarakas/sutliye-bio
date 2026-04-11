import type { Metadata } from "next";
import Script from "next/script";
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

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        {children}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: true });
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
