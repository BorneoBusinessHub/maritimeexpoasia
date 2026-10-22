import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const sans = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://maritimeexpoasia.com"),
  title: { default: "Maritime Expo Asia 2027 | Sibu, Sarawak", template: "%s | Maritime Expo Asia 2027" },
  description:
    "Maritime Expo Asia 2027, Sibu, Sarawak, September 2027. Where shipyards, suppliers and buyers meet in Sarawak's shipbuilding capital.",
  openGraph: { siteName: "Maritime Expo Asia", type: "website", locale: "en_MY" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Nav />

        <main className="flex-1">{children}</main>

        <footer className="bg-abyss text-pale">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 text-base sm:grid-cols-2 sm:px-8">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight text-white">Maritime Expo Asia</p>
              <p className="mt-3 max-w-sm text-pale/80">
                The home of Maritime Expo Asia 2027, maritime events we co-host with industry partners, and a calendar
                of maritime events worldwide.
              </p>
            </div>
            <div className="sm:text-right">
              <p>
                <Link href="/contact" className="underline decoration-white/30 underline-offset-4 transition-colors duration-500 ease-fluid hover:text-white">
                  Contact us
                </Link>
                <span className="mx-3 text-white/30">·</span>
                <Link href="/privacy" className="underline decoration-white/30 underline-offset-4 transition-colors duration-500 ease-fluid hover:text-white">
                  Privacy
                </Link>
              </p>
              <p className="mt-5 text-sm text-pale/60">© 2026 [TBC: BBH PLT or MarineX International]</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
