import { withBasePath } from "../lib/base-path";
import type { Metadata } from "next";
import { preload } from "react-dom";
import "@alex-infield/compass-augmentation/styles.css";
import "./alex-tokens.css";
import "./portfolio-type.css";
import "./globals.css";
import { socialMetadata } from "@/lib/social-metadata";

const firstScreenFonts = [
  "/assets/home/media/6709e4711141238c6075e88b_FunktionalGrotesk-Regular.woff2",
  "/assets/home/media/6709e4713af7da131946bb76_FunktionalGrotesk-Medium.woff2",
];

const googleAnalyticsId = process.env.PORTFOLIO_GA_ID?.trim() || "G-C6H8Q9R5B5";
const clarityProjectId = process.env.PORTFOLIO_CLARITY_ID?.trim() || "xz6mz3a8cb";

export const metadata: Metadata = {
  metadataBase: new URL("https://alexinfield.com"),
  ...socialMetadata("Alex Infield", "Alex Infield", "/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // First-screen Funktional Grotesk faces load with the HTML so text never
  // paints in a fallback face (the @font-face rules use font-display: block).
  for (const href of firstScreenFonts) preload(withBasePath(href), { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href={withBasePath("/favicon.png")} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

      </head>
      <body>
        <a href="#main-content" tabIndex={0} className="portfolio-skip-link">Skip to content</a>
        {children}
        <script src={withBasePath("/portfolio-runtime.js")} defer />
        <script src={withBasePath("/portfolio-analytics.js")} data-ga-id={googleAnalyticsId} data-clarity-id={clarityProjectId} defer />
      </body>
    </html>
  );
}
