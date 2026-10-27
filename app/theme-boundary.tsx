"use client";
import { useSyncExternalStore, type ReactNode } from "react";
import { DesignSystemBoundary } from "./compass";
import { effectiveTheme, subscribeAppearance } from "@/lib/portfolio-theme";

export default function ThemeBoundary({ inverse = false, children }: { inverse?: boolean; children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeAppearance, effectiveTheme, () => inverse ? "light" : "dark");
  return <DesignSystemBoundary theme={theme} className="portfolio-root portfolio-boundary"
    data-portfolio-boundary suppressHydrationWarning>{children}</DesignSystemBoundary>;
}
