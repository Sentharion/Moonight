import { defaultCache } from "@serwist/next/worker";
import type {
    PrecacheEntry,
    SerwistGlobalConfig,
} from "serwist";
import {
    Serwist,
    NetworkOnly,
    CacheFirst,
    StaleWhileRevalidate,
} from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,

    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,

    runtimeCaching: [
        ...defaultCache,

        // Obrazki
        {
            matcher({ request }) {
                return request.destination === "image";
            },
            handler: new CacheFirst({
                cacheName: "moonight-images",
            }),
        },

        // CSS
        {
            matcher({ request }) {
                return request.destination === "style";
            },
            handler: new StaleWhileRevalidate({
                cacheName: "moonight-styles",
            }),
        },

        // JS
        {
            matcher({ request }) {
                return request.destination === "script";
            },
            handler: new StaleWhileRevalidate({
                cacheName: "moonight-scripts",
            }),
        },

        // Supabase / API — zawsze sieć
        {
            matcher({ url }) {
                return url.hostname.endsWith("supabase.co");
            },
            handler: new NetworkOnly(),
        },
    ],
});

serwist.addEventListeners();