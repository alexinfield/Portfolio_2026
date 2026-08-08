import type { Metadata } from "next";
import "./globals.css";

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
  title: "Alex Infield",
  description: "Selected work by industrial designer Alex Infield.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsBootstrap }} />
        {clarityBootstrap ? <script dangerouslySetInnerHTML={{ __html: clarityBootstrap }} /> : null}
        <link
          href="/assets/home/media/portfolio-source.min.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body>
        {children}
        <script src="/portfolio-runtime.js" defer />
        <script src="/portfolio-analytics.js" defer />
      </body>
    </html>
  );
}
