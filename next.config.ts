import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Permanent (308) redirects keep old links working; query strings such as ?type=exhibitor pass through.
  async redirects() {
    return [
      { source: "/summit-2027", destination: "/events/sarawak-maritime-industry-summit-2027", permanent: true },
      { source: "/events/maritime-expo-asia-2027", destination: "/maritime-expo-asia-2027", permanent: true },
    ];
  },
};

export default nextConfig;
