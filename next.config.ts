import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep PDF parsing dependencies as server-side packages so their worker/native
  // files are available in Vercel Functions.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/tasting-room/sales-analysis": ["./data/tasting-room-history/*.json"],
  },
};

export default nextConfig;
