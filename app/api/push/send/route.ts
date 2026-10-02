import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import { sendPushNotification } from "../../../lib/notifications/sendPushNotifications";

interface NotificationRequest {
    userIds: string[];
    title?: string;
    message?: string;
    url?: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nie jesteś zalogowany.",
                },
                { status: 401 }
            );
        }

        const body = (await request.json()) as NotificationRequest;

        if (!Array.isArray(body.userIds) || body.userIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Brak odbiorców.",
                },
                { status: 400 }
            );
        }

        // Nie pozwalamy użytkownikowi wysłać
        // powiadomienia samemu sobie.
        const recipientIds = [
            ...new Set(
                body.userIds.filter(
                    (userId) => userId && userId !== user.id
                )
            ),
        ];

        if (recipientIds.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                failed: 0,
                message: "Brak odbiorców po odfiltrowaniu autora.",
            });
        }

        const result = await sendPushNotification(
            supabase,
            recipientIds,
            {
                title:
                    body.title ??
                    "Moonight 🎬",

                body:
                    body.message ??
                    "Masz nowe powiadomienie.",

                url:
                    body.url ??
                    "/dashboard",
            }
        );

        return NextResponse.json({
            success: result.failed === 0,
            sent: result.sent,
            failed: result.failed,
        });
    } catch (error) {
        console.error("Push API error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Nie udało się wysłać powiadomienia.",
            },
            { status: 500 }
        );
    }
}
