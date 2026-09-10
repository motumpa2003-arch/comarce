import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@obsidian/ui", "@obsidian/commerce", "@obsidian/data"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    // The image CDN already resizes and format-negotiates via query params
    // (auto=format&w=...), so proxying every asset through the Next optimizer
    // only adds a hop that times out under a cold cache.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
