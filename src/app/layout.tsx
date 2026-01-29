import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArtConnect - Book Verified Artists for Custom Portraits & Art",
  description: "Connect with talented artists for custom portraits, paintings, sketches, and digital art. Get a digital portrait in 24-48 hours or order physical art delivered to your home.",
  keywords: "custom portraits, digital art, painting, sketch, artist marketplace, commissioned art, portrait artist, custom painting, art commission",
  openGraph: {
    title: "ArtConnect - Book Verified Artists for Custom Portraits & Art",
    description: "Transform your moments into timeless masterpieces. Connect with verified artists for custom portraits, paintings, and digital art.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${poppins.variable} ${inter.variable}`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
