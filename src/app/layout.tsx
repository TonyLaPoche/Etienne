import type { Metadata, Viewport } from "next";
import { Baloo_Bhai_2, Barlow_Semi_Condensed } from "next/font/google";
import { AtelierProvider } from "@/components/atelier-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const baloo = Baloo_Bhai_2({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-baloo",
  display: "swap",
});

const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ADTP Fiches",
    template: "%s · ADTP Fiches",
  },
  description:
    "POC de fiches personnages et de compétences pour ADTP. Comptes administrateurs de démonstration, données conservées dans le navigateur.",
  applicationName: "ADTP Fiches",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "ADTP Fiches",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#E74536",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${baloo.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-ink">
        <AtelierProvider>
          {children}
          <PwaRegister />
        </AtelierProvider>
      </body>
    </html>
  );
}
