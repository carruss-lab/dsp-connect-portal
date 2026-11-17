import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  // Addresses from the old site that people may still have saved or that search engines still list.
  async redirects() {
    return [
      // Old sub-addresses now forward to their replacements, whatever page was asked for.
      { source: "/:path*", has: [{ type: "host", value: "portal.getdspconnect.com" }], destination: "https://getdspconnect.com/open-account", permanent: false },
      { source: "/:path*", has: [{ type: "host", value: "helpdesk.getdspconnect.com" }], destination: "https://help.getdspconnect.com", permanent: false },
      { source: "/:path*", has: [{ type: "host", value: "academy.getdspconnect.com" }], destination: "https://getdspconnect.com", permanent: false },
      { source: "/:path*", has: [{ type: "host", value: "join.getdspconnect.com" }], destination: "https://getdspconnect.com", permanent: false },
      // Vercel's own address for the live site: one address, so saved details and chat sign-in stay together.
      { source: "/:path*", has: [{ type: "host", value: "dsp-connect-site.vercel.app" }], destination: "https://getdspconnect.com/:path*", permanent: true },
      { source: "/launch-client.html", destination: "/open-account", permanent: true },
      { source: "/platform-comparisons-dsp-connect", destination: "/compare", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
