import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { BrandProvider } from "@/components/shared/brand-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import type { Brand } from "@/lib/utils";

/**
 * Reference root layout for the design system. Real application
 * routes (Phase 5+) will live under app/[locale]/... per the Phase 2
 * folder structure and will set `lang`/`dir` from the route's locale
 * segment instead of hardcoding "en"/"ltr" as this reference layout
 * does. This file exists so the style-guide page has something to
 * mount inside, and so the exact font/provider wiring pattern is
 * demonstrated once, in one place, rather than re-derived per page.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-latin-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-labs-display", display: "swap" });

export const metadata: Metadata = {
  title: "CyberAbeer Design System",
  description: "Reusable component library - not an application page.",
};

const DEFAULT_BRAND: Brand = "cyberabeer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <BrandProvider brand={DEFAULT_BRAND}>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
