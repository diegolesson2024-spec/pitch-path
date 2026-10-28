import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display-face",
});

const description =
  "Evaluations, development plans and progress tracking that show every young player what to improve and how to improve it.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "PitchPath: Player development for soccer clubs", template: "%s · PitchPath" },
  description,
  applicationName: "PitchPath",
  openGraph: {
    type: "website",
    siteName: "PitchPath",
    title: "PitchPath: Player development for soccer clubs",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "PitchPath", description },
};

export const viewport: Viewport = { themeColor: "#040919" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
