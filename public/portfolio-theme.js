// Appearance ownership adapted from the approved Compass portfolio-theme.ts.
// One controller serves static cases and hydrated pages, including /next/.
(() => {
  const root = document.documentElement;
  const key = "portfolio-compass-theme";
  const query = matchMedia("(prefers-color-scheme: light)");
  const prefix = new URL(document.currentScript.src).pathname.replace(/portfolio-theme\.js$/, "");
  const path = location.pathname.startsWith(prefix) ? "/" + location.pathname.slice(prefix.length) : location.pathname;
  const inverted = /^\/personal(?:\/|$)/.test(path);
  const valid = value => ["light", "dark", "system"].includes(value);
  let appearance = "dark";
  try { const saved = localStorage.getItem(key); if (valid(saved)) appearance = saved; } catch { /* Storage is optional. */ }
  const siteTheme = () => appearance === "system" ? (query.matches ? "light" : "dark") : appearance;
  const effective = () => inverted ? (siteTheme() === "dark" ? "light" : "dark") : siteTheme();
  function sync() {
    const theme = effective();
    const changed = root.dataset.theme !== theme;
    if (changed) {
      // Match the kit provider's no-transition appearance changes: inherited
      // text and canvas must switch together rather than cross-fade through
      // a low-contrast frame.
      root.dataset.themeChanging = "true";
      void root.offsetHeight;
    }
    root.dataset.portfolioAppearance = appearance;
    root.dataset.portfolioSiteTheme = siteTheme();
    root.dataset.portfolioThemeInverted = String(inverted);
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document.querySelectorAll("[data-portfolio-boundary]").forEach(boundary => {
      boundary.dataset.theme = theme;
      boundary.classList.toggle("dark", theme === "dark");
      boundary.style.colorScheme = theme;
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-pressed", String(siteTheme() === "dark"));
      button.setAttribute("aria-label", `Site appearance: ${appearance}. Switch to ${siteTheme() === "dark" ? "Light" : "Dark"}`);
      button.title = `Site appearance: ${appearance}. Switch to ${siteTheme() === "dark" ? "Light" : "Dark"}`;
    });
    if (changed) {
      void root.offsetHeight;
      requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeChanging));
    }
  }
  function set(next) {
    if (!valid(next)) return;
    appearance = next;
    try { localStorage.setItem(key, next); } catch { /* Keep working in this document. */ }
    sync();
    dispatchEvent(new Event("portfolio-appearance-change"));
  }
  window.PortfolioTheme = { get: () => appearance, effective, set };
  sync();
  new MutationObserver(sync).observe(root, { childList: true, subtree: true });
  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-theme-toggle]")) set(siteTheme() === "dark" ? "light" : "dark");
  });
  document.addEventListener("focusin", event => {
    const header = event.target.closest?.(".portfolio-header");
    if (!header) return;
    const bounds = header.getBoundingClientRect(), target = event.target.getBoundingClientRect();
    if (target.left < bounds.left + 6) header.scrollLeft += target.left - bounds.left - 6;
    else if (target.right > bounds.right - 6) header.scrollLeft += target.right - bounds.right + 6;
  });
  const refresh = () => { sync(); dispatchEvent(new Event("portfolio-appearance-change")); };
  query.addEventListener("change", refresh);
  addEventListener("pageshow", () => {
    // A cached document may have missed a preference changed on another route
    // in this same tab; that write does not dispatch a storage event here.
    try { const saved = localStorage.getItem(key); appearance = valid(saved) ? saved : "dark"; } catch { /* Retain the usable in-document preference. */ }
    refresh();
  });
  addEventListener("storage", event => {
    if (event.key !== key && event.key !== null) return;
    appearance = valid(event.newValue) ? event.newValue : "dark";
    refresh();
  });
})();
