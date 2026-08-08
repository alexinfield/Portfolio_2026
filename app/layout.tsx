import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alexinfield.com"),
  title: "Alex Infield",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="/assets/home/media/ainfield.webflow.shared.5c0f55512.min.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body>
        {children}
        <script src="/portfolio-runtime.js" defer />
      </body>
    </html>
  );
}
