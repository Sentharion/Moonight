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

        // Supabase / API — always network, MUST be before the image rule below
        // so that avatar images served from *.supabase.co are not intercepted
        // by CacheFirst and served stale after an upload.
        {
            matcher({ url }) {
                return url.hostname.endsWith("supabase.co");
            },
            handler: new NetworkOnly(),
        },

        // Obrazki (non-Supabase)
        {
            matcher({ request, url }) {
                return request.destination === "image" && !url.hostname.endsWith("supabase.co");
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

    ],
});

serwist.addEventListeners();