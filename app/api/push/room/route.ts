import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { sendPushNotification } from "../../../lib/notifications/sendPushNotifications";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { message: "Nie jesteś zalogowany." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            roomId,
            title,
            message,
        } = body;

        if (!roomId || !title || !message) {
            return NextResponse.json(
                { message: "Brak wymaganych danych." },
                { status: 400 }
            );
        }

        // Pobieramy uczestników pokoju
        const { data: participants, error: participantsError } =
            await supabase
                .from("movie_room_participants")
                .select("user_id")
                .eq("room_id", roomId)
                .neq("user_id", user.id);

        if (participantsError) {
            console.error(
                "Błąd pobierania uczestników:",
                participantsError
            );

            return NextResponse.json(
                { message: "Nie udało się pobrać uczestników." },
                { status: 500 }
            );
        }

        const userIds = (participants ?? []).map(
            (participant) => participant.user_id
        );

        const result = await sendPushNotification(
            supabase,
            userIds,
            {
                title,
                body: message,
                url: `/room/${body.inviteCode}`,
            }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("Room notification error:", error);

        return NextResponse.json(
            { message: "Nie udało się wysłać powiadomienia." },
            { status: 500 }
        );
    }
}