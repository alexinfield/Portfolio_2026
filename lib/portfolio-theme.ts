// The non-React controller owns appearance. React subscribes after hydration.
export type SiteAppearance = "light" | "dark" | "system";
export type SiteTheme = "light" | "dark";
declare global {
  interface Window {
    PortfolioTheme?: { get(): SiteAppearance; effective(): SiteTheme; set(value: SiteAppearance): void };
  }
}
export function subscribeAppearance(callback: () => void) {
  window.addEventListener("portfolio-appearance-change", callback);
  return () => window.removeEventListener("portfolio-appearance-change", callback);
}
export const readAppearance = () => window.PortfolioTheme?.get() ?? "dark";
export const effectiveTheme = () => window.PortfolioTheme?.effective() ?? "dark";
export const initialAppearance = () => "dark" as const;
export function setAppearance(value: SiteAppearance) { window.PortfolioTheme?.set(value); }
