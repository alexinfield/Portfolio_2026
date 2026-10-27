"use client";
import { useSyncExternalStore } from "react";
import { ToggleGroup, ToggleGroupItem } from "./compass";
import { initialAppearance, readAppearance, setAppearance, subscribeAppearance } from "@/lib/portfolio-theme";

const subscribeReady = () => () => {};
export default function AppearanceControl() {
  const appearance = useSyncExternalStore(subscribeAppearance, readAppearance, initialAppearance);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
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
