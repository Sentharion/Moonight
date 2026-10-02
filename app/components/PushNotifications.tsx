"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) => char.charCodeAt(0))
    );
}

async function getSWRegistration() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return null;
    }
    try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            registration = await navigator.serviceWorker.register("/sw.js");
        }
        await navigator.serviceWorker.ready;
        return registration;
    } catch (err) {
        console.error("Service worker registration error:", err);
        return null;
    }
}

export default function PushNotifications() {
    const supabase = createClient();

    const [supported, setSupported] = useState(false);
    const [permission, setPermission] =
        useState<NotificationPermission>("default");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkPushSupport = async () => {
            if (
                typeof window === "undefined" ||
                !("Notification" in window) ||
                !("serviceWorker" in navigator) ||
                !("PushManager" in window)
            ) {
                return;
            }

            setSupported(true);
            setPermission(Notification.permission);

            try {
                const registration = await getSWRegistration();
                if (!registration) return;

                const existingSubscription =
                    await registration.pushManager.getSubscription();

                setSubscribed(Boolean(existingSubscription));
            } catch (err) {
                console.error(
                    "Nie udało się sprawdzić subskrypcji push:",
                    err
                );
            }
        };

        checkPushSupport();
    }, []);

    const subscribeToPush = async () => {
        if (!supported || loading) return;

        setLoading(true);
        setError("");

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Musisz być zalogowany.");
            }

            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
                throw new Error(
                    "Brak NEXT_PUBLIC_VAPID_PUBLIC_KEY w zmiennych środowiskowych."
                );
            }

            const currentPermission =
                await Notification.requestPermission();

            setPermission(currentPermission);

            if (currentPermission !== "granted") {
                throw new Error(
                    "Nie udzielono zgody na wysyłanie powiadomień w przeglądarce."
                );
            }

            const registration = await getSWRegistration();

            if (!registration) {
                throw new Error(
                    "Nie udało się uzyskać rejestracji Service Workera."
                );
            }

            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription =
                    await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            urlBase64ToUint8Array(
                                process.env
                                    .NEXT_PUBLIC_VAPID_PUBLIC_KEY
                            ),
                    });
            }

            const subscriptionJson =
                subscription.toJSON();

            if (
                !subscription.endpoint ||
                !subscriptionJson.keys?.p256dh ||
                !subscriptionJson.keys?.auth
            ) {
                throw new Error(
                    "Nie udało się pobrać danych subskrypcji push."
                );
            }

            const { error: insertError } =
                await supabase
                    .from("push_subscriptions")
                    .upsert(
                        {
                            user_id: user.id,
                            endpoint: subscription.endpoint,
                            p256dh:
                                subscriptionJson.keys.p256dh,
                            auth: subscriptionJson.keys.auth,
                        },
                        {
                            onConflict: "user_id,endpoint",
                        }
                    );

            if (insertError) {
                console.error(
                    "Błąd zapisywania subskrypcji:",
                    insertError
                );

                throw new Error(
                    "Nie udało się zapisać subskrypcji."
                );
            }

            setSubscribed(true);
        } catch (err) {
            console.error(
                "Push subscription error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Nie udało się włączyć powiadomień."
            );
        } finally {
            setLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        if (!supported || loading) return;

        setLoading(true);
        setError("");

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Musisz być zalogowany.");
            }

            const registration = await getSWRegistration();

            if (!registration) {
                setSubscribed(false);
                return;
            }

            const subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                setSubscribed(false);
                return;
            }

            const endpoint = subscription.endpoint;

            await subscription.unsubscribe();

            const { error: deleteError } =
                await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("endpoint", endpoint);

            if (deleteError) {
                console.error(
                    "Błąd usuwania subskrypcji z Supabase:",
                    deleteError
                );
            }

            setSubscribed(false);
        } catch (err) {
            console.error(
                "Push unsubscribe error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Nie udało się wyłączyć powiadomień."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!supported) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-sm border border-border bg-card-bg px-4 py-3 dark:border-border dark:bg-[#0e0e1a]">
                <div>
                    <div className="vhs-badge text-text-light uppercase">
                        Powiadomienia Push
                    </div>

                    <div className="mt-0.5 text-[13px] font-medium text-foreground">
                        {subscribed ? "🔔 WŁĄCZONO" : "🔕 WYŁĄCZONO"}
                    </div>
                </div>

                <button
                    onClick={
                        subscribed
                            ? unsubscribeFromPush
                            : subscribeToPush
                    }
                    disabled={
                        loading ||
                        permission === "denied"
                    }
                    aria-label={subscribed ? "Wyłącz powiadomienia" : "Włącz powiadomienia"}
                    className={`relative h-6.5 w-12 shrink-0 cursor-pointer rounded-sm border-border border-1 transition-all duration-300 bg-input-bg dark:bg-[#080810] disabled:opacity-50 disabled:cursor-not-allowed ${
                        subscribed
                            ? "bg-neon-pink"
                            : ""
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-4.5 w-4.5 rounded-sm transition-all duration-300 ${
                            subscribed
                                ? "left-6.5 bg-neon-pink"
                                : "left-0.5 bg-text-light/50"
                        }`}
                    />
                </button>
            </div>

            {permission === "denied" && (
                <div className="vhs-badge text-center text-amber-500 text-[11px]">
                    ⚠️ Powiadomienia są zablokowane w ustawieniach przeglądarki.
                </div>
            )}

            {error && (
                <div className="vhs-badge text-center text-red-500 text-[11px]">
                    {error}
                </div>
            )}
        </div>
    );
}


