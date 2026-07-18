import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>
        {children}
        <script src="/portfolio-runtime.js" defer />
      </body>
    </html>
  );
}
