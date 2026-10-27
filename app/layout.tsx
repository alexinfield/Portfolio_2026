import type { Metadata } from "next";
import "@alex-infield/compass-augmentation/styles.css";
import "./alex-tokens.css";
import "./portfolio-type.css";
import "./globals.css";
import { socialMetadata } from "@/lib/social-metadata";

const googleAnalyticsId = process.env.PORTFOLIO_GA_ID?.trim() || "G-C6H8Q9R5B5";
const clarityProjectId = process.env.PORTFOLIO_CLARITY_ID?.trim() || "xz6mz3a8cb";

const googleAnalyticsBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');
`;

const clarityBootstrap = clarityProjectId
  ? `(function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script","${clarityProjectId}");`
  : null;

export const metadata: Metadata = {
  metadataBase: new URL("https://alexinfield.com"),
  ...socialMetadata("Alex Infield", "Selected work by industrial designer Alex Infield.", "/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsBootstrap }} />
        {clarityBootstrap ? <script dangerouslySetInnerHTML={{ __html: clarityBootstrap }} /> : null}
      </head>
      <body>
        {children}
        <script src="/portfolio-runtime.js" defer />
        <script src="/portfolio-analytics.js" defer />
      </body>
    </html>
  );
}
