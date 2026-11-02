"use client";
import type { ReactNode } from "react";
import { DesignSystemBoundary } from "./compass";

// Alex's portfolio-specific exception: Personal is light; all other routes dark.
export default function PaletteBoundary({ light=false, children }: {light?:boolean;children:ReactNode}) {
  return <DesignSystemBoundary theme={light ? "light" : "dark"} className="portfolio-root portfolio-boundary" data-portfolio-boundary>{children}</DesignSystemBoundary>;
}
