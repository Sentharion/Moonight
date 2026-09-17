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
                src: "/192-maskable.jpg",
                sizes: "192x192",
                type: "image/jpg",
                purpose: "maskable"
            },
            {
                src: "/512-maskable.jpg",
                sizes: "512x512",
                type: "image/jpg",
                purpose: "maskable"
            }
        ],
    };
}