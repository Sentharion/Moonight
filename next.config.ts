import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    ]
  }
};

export default nextConfig;
