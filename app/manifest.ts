import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "UBL Hub", short_name: "UBL Hub", lang: "id",
    description: "Aplikasi alumni Universitas Bandar Lampung",
    start_url: "/", scope: "/", display: "standalone",
    background_color: "#ffffff", theme_color: "#071952",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
