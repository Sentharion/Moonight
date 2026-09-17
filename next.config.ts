import type { NextConfig } from "next";

import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  webpack: (config) => config,
  images:{
    remotePatterns: [
      {
        protocol:"https",
        hostname:"fwcdn.pl",
      },
      {
        protocol:"https",
        hostname:"image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "skomplikowane.pl",
      },
      {
        protocol: "https",
        hostname: "vxzsdyxbobvimeafjctx.supabase.co",
      },
    ]
  }
};

export default withSerwist(nextConfig);
