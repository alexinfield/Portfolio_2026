"use client";
import { useSyncExternalStore } from "react";
import { ToggleGroup, ToggleGroupItem } from "./compass";
import { readAppearance, setAppearance, subscribeAppearance, type SiteAppearance } from "@/lib/portfolio-theme";

export default function AppearanceControl() {
  // Preference and readiness reconcile in one update. A fast header toggle
  // during hydration must never enable a stale, already-selected radio.
  const snapshot = useSyncExternalStore<SiteAppearance | "initial">(subscribeAppearance, readAppearance, () => "initial");
  const ready = snapshot !== "initial";
  const appearance = ready ? snapshot : "dark";
  return <div className="portfolio-appearance">
    <span id="appearance-label" className="text-sm text-muted">Appearance</span>
    <ToggleGroup type="single" spacing={0} disabled={!ready} aria-labelledby="appearance-label" value={appearance}
      onValueChange={value => { if (value === "light" || value === "dark" || value === "system") setAppearance(value); }}>
      <ToggleGroupItem value="light">Light</ToggleGroupItem>
      <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
      <ToggleGroupItem value="system">System</ToggleGroupItem>
    </ToggleGroup>
  </div>;
}
