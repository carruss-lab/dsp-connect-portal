import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  // Addresses from the old site that people may still have saved or that search engines still list.
  async redirects() {
    return [
      // Old sub-addresses now forward to their replacements, whatever page was asked for.
      { source: "/:path*", has: [{ type: "host", value: "portal.getdspconnect.com" }], destination: "https://getdspconnect.com/open-account", permanent: false },
      { source: "/:path*", has: [{ type: "host", value: "helpdesk.getdspconnect.com" }], destination: "https://help.getdspconnect.com", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "academy.getdspconnect.com" }], destination: "https://getdspconnect.com", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "join.getdspconnect.com" }], destination: "https://getdspconnect.com/partners", permanent: false },
      // Short address for recruiting: business cards, emails, ads.
      { source: "/:path*", has: [{ type: "host", value: "partners.getdspconnect.com" }], destination: "https://getdspconnect.com/partners", permanent: false },
      // Vercel's own address for the live site: one address, so saved details and chat sign-in stay together.
      { source: "/:path*", has: [{ type: "host", value: "dsp-connect-site.vercel.app" }], destination: "https://getdspconnect.com/:path*", permanent: true },
      { source: "/launch-client.html", destination: "/open-account", permanent: true },
      { source: "/platform-comparisons-dsp-connect", destination: "/compare", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
      // Old-site pages Google still lists as "not found" (Search Console, Nov 18 2026): sent to the closest page today.
      { source: "/real-estate-ctv-advertising", destination: "/industries/real-estate", permanent: true },
      { source: "/advertising-network", destination: "/", permanent: true },
      { source: "/advanced-media-buying-attribution-tracking", destination: "/", permanent: true },
      { source: "/logo", destination: "/about", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
      // The StackAdapt comparison first went live with a stray period in its address.
      { source: "/dsp-connect-vs.-stackadapt", destination: "/dsp-connect-vs-stackadapt", permanent: true },
    ];
  },
};

export default nextConfig;
