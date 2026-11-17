import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  // Addresses from the old site that people may still have saved or that search engines still list.
  async redirects() {
    return [
      { source: "/platform-comparisons-dsp-connect", destination: "/compare", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
