import type { Metadata } from "next";
import "./globals.css";
import "./portfolio.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alexinfield.com"),
  title: "Alex Infield — Industrial Design Portfolio",
  description: "Selected industrial design work by Alex Infield.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Alex Infield — Industrial Design Portfolio",
    description: "Selected industrial design work by Alex Infield.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        {children}
        <script src="/portfolio-runtime.js" defer />
      </body>
    </html>
  );
}
