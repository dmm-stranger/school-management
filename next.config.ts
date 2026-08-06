import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo/placeholder image providers used by src/config/media.ts.
    // Swap these for your real CDN/domain once you have actual assets —
    // see docs/STEP-4-MEDIA-STORE.md.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
