import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Developer Portfolio",
    short_name: "Portfolio",
    description:
      "A verified developer-focused portfolio and interactive technical résumé.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b0b",
    theme_color: "#58e6b0",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
