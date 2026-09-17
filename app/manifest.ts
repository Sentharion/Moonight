import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Moonight",
        short_name: "Moonight",
        description: "Planer wieczorów filmowych",

        start_url: "/",
        display: "standalone",
        orientation: "portrait",

        background_color: "#080810",
        theme_color: "#080810",

        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/icon-192-maskable.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/icon-512-maskable.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            }
        ],
    };
}