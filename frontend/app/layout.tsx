import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://digiprofilo.com"),
  title: "DigiProfilo - Digital Profiles, Business Cards, Catalogs & Resumes",
  description: "Create and share digital business cards, product catalogs, professional resumes, and online profiles with DigiProfilo.",
  keywords: [
    "digital visiting card",
    "product catalog",
    "digital resume",
    "professional profile",
    "QR code visiting card",
    "online business card",
    "DigiProfilo",
  ],
  authors: [{ name: "DigiProfilo" }],
  openGraph: {
    title: "DigiProfilo - Digital Profiles, Business Cards, Catalogs & Resumes",
    description: "Create and share digital business cards, product catalogs, professional resumes, and online profiles with DigiProfilo.",
    url: "https://digiprofilo.com",
    siteName: "DigiProfilo",
    images: [
      {
        url: "/logo-transparent.png",
        width: 800,
        height: 600,
        alt: "DigiProfilo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiProfilo - Digital Profiles, Business Cards, Catalogs & Resumes",
    description: "Create and share digital business cards, product catalogs, professional resumes, and online profiles with DigiProfilo.",
    images: ["/logo-transparent.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
