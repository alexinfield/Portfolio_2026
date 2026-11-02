import type { NextConfig } from "next";

const basePath = process.env.PORTFOLIO_BASE_PATH ?? "";
if (!["", "/next"].includes(basePath)) throw new Error("Unsupported portfolio base path");
if (basePath && process.env.PORTFOLIO_ALLOW_INDEXING === "true") {
  throw new Error("Mounted private reviews must remain noindex");
}

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
