import type { CSSProperties } from "react";
import data from "./lqip.json";

// Server-only lookup of the low-res placeholders (scripts/generate-lqip.py): a tiny WebP inside an
// SVG that blurs, dims and desaturates it at display resolution, so it never shows blocks.
// A media element paints its placeholder as its own background until the real image
// or poster covers it, so slow loads never show an empty box and nothing wraps the media.
const images = (data as { images: Record<string, string> }).images;
export const lqipFor = (source?: string) => (source ? images[source] : undefined);
export function lqipProps(source?: string, style?: CSSProperties, fromFrame = false) {
  const placeholder = lqipFor(source);
  if (!placeholder) return { style };
  if (fromFrame) return { style, "data-lqip": "" };
  return { style: { ...style, "--lqip": `url("${placeholder}")` } as CSSProperties, "data-lqip": "" };
}
// Home cards: the card (already the cover's clipping frame) carries the placeholder, so the cover
// can fade in over it; the cover inherits --lqip for the instant-swap path (no JS, reduced motion).
export function lqipFrameProps(source?: string) {
  const placeholder = lqipFor(source);
  if (!placeholder) return {};
  return { style: { "--lqip": `url("${placeholder}")` } as CSSProperties, "data-lqip-frame": "" };
}
