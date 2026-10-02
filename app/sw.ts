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

self.addEventListener("push", (event) => {
    if(!event.data) return;

    try{
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title ?? "Moonight",
            {
                body: data.body ?? "",
                icon: data.icon ?? "/icon-192.png",
                badge: data.badge ?? "/icon-192.png",
                data: {
                    url: data.url ?? "/",
                }
            })
        );
    } catch (error){
       console.error("Push notification error:", error);
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url ?? "/";

    event.waitUntil(
        self.clients.matchAll({
            type:"window",
            includeUncontrolled: true,
        }).then((clients) => {
            const existingClient = clients.find(
                (client) => "focus" in client
            );

            if(existingClient){
                existingClient.navigate(url);
                return existingClient.focus();
            }

            return self.clients.openWindow(url);
        })
    )
});

serwist.addEventListeners();