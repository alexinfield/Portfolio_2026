// Vinext injects the same Next basePath into server and browser bundles.
const basePath = process.env.__NEXT_ROUTER_BASEPATH ?? "";

export function withBasePath(value: string): string {
  if (!basePath || !value.startsWith("/") || value.startsWith("//")) return value;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;
  return `${basePath}${value}`;
}
