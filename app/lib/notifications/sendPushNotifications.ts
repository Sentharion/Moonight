import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { createAdminClient } from "../supabase/admin";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export interface PushNotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
}

export interface SendPushNotificationResult {
    success: boolean;
    sent: number;
    failed: number;
}

export async function sendPushNotification(
    supabase: SupabaseClient,
    userIds: string[],
    notification: PushNotificationPayload
): Promise<SendPushNotificationResult> {
    if (userIds.length === 0) {
        return {
            success: true,
            sent: 0,
            failed: 0,
        };
    }

    // Use the admin client so RLS does not block reading other users' subscriptions.
    const adminClient = createAdminClient();

    const {
        data: subscriptions,
        error: subscriptionsError,
    } = await adminClient
        .from("push_subscriptions")
        .select("id, user_id, endpoint, p256dh, auth")
        .in("user_id", userIds);

    if (subscriptionsError) {
        console.error(
            "Błąd pobierania subskrypcji push:",
            subscriptionsError
        );

        throw new Error("Nie udało się pobrać subskrypcji push.");
    }

    if (!subscriptions || subscriptions.length === 0) {
        return {
            success: true,
            sent: 0,
            failed: 0,
        };
    }

    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon ?? "/icon-192.png",
        badge: notification.badge ?? "/icon-192.png",
        url: notification.url ?? "/",
    });

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dh,
                        auth: subscription.auth,
                    },
                },
                payload
            );

            sent++;
        } catch (error: unknown) {
            failed++;

            console.error(
                "Błąd wysyłania push:",
                subscription.endpoint,
                error
            );

            const statusCode =
                typeof error === "object" &&
                error !== null &&
                "statusCode" in error
                    ? (error as { statusCode?: number }).statusCode
                    : undefined;

            // Subskrypcja już nie istnieje — usuwamy ją z DB.
            if (statusCode === 404 || statusCode === 410) {
                const { error: deleteError } = await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("id", subscription.id);

                if (deleteError) {
                    console.error(
                        "Nie udało się usunąć nieaktywnej subskrypcji:",
                        deleteError
                    );
                }
            }
        }
    }

    return {
        success: failed === 0,
        sent,
        failed,
    };
}