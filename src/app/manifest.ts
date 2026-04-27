import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: siteConfig.themeColor,
    lang: "sk",
    icons: [
      {
        src: "/icons/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
