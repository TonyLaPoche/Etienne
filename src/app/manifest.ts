import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ADTP Fiches",
    short_name: "ADTP Fiches",
    description: "Fiches personnages et compétences — POC ADTP",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#F4F4F4",
    theme_color: "#E74536",
    lang: "fr",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
