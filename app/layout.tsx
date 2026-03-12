import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ocakbasi Sofrasi",
  description: "Kebapci icin mobil uyumlu sube, iletisim ve menu deneyimi.",
  openGraph: {
    title: "Ocakbasi Sofrasi",
    description: "Sube sec, menuyu incele, tek dokunusla ara veya yol tarifi al."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
