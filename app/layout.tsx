import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getPublicBusiness } from "@/lib/server/public-data";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL ?? "https://example.com";
  const business = await getPublicBusiness();
  const title = business.seoTitle || business.name;
  const description = business.seoDescription || business.tagline;

  const logoUrl = business.logoUrl;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title}`
    },
    description,
    ...(logoUrl
      ? {
          icons: {
            icon: logoUrl,
            shortcut: logoUrl,
            apple: logoUrl
          }
        }
      : {}),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: title,
      ...(logoUrl ? { images: [{ url: logoUrl }] } : {})
    },
    twitter: {
      title,
      description,
      card: "summary",
      ...(logoUrl ? { images: [logoUrl] } : {})
    }
  };
}

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={jakartaSans.variable}>
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
