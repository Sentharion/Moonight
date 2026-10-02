import type { SupabaseClient } from "@supabase/supabase-js";

import {
    sendPushNotification,
    type PushNotificationPayload,
    type SendPushNotificationResult,
} from "./sendPushNotifications";

interface NotifyRoomParticipantsResult {
    success: boolean;
    recipients: number;
    sent: number;
    failed: number;
}

export async function notifyRoomParticipants(
    supabase: SupabaseClient,
    roomId: string,
    senderUserId: string,
    notification: PushNotificationPayload
): Promise<NotifyRoomParticipantsResult> {
    const { data: participants, error } = await supabase
        .from("movie_room_participants")
        .select("user_id")
        .eq("room_id", roomId);

    if (error) {
        console.error(
            "Błąd pobierania uczestników pokoju:",
            error
        );

        throw new Error(
            "Nie udało się pobrać uczestników pokoju."
        );
    }

    if (!participants || participants.length === 0) {
        return {
            success: true,
            recipients: 0,
            sent: 0,
            failed: 0,
        };
    }

    // Usuwamy autora akcji oraz ewentualne duplikaty.
    const recipientIds = [
        ...new Set(
            participants
                .map((participant) => participant.user_id)
                .filter((userId) => userId && userId !== senderUserId)
        ),
    ];

    if (recipientIds.length === 0) {
        return {
            success: true,
            recipients: 0,
            sent: 0,
            failed: 0,
        };
    }

    const result: SendPushNotificationResult =
        await sendPushNotification(
            supabase,
            recipientIds,
            notification
        );

    return {
        success: result.failed === 0,
        recipients: recipientIds.length,
        sent: result.sent,
        failed: result.failed,
    };
}
