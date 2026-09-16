import type { SupabaseClient } from "@supabase/supabase-js";
import type { MovieRoom, User, SelectedMovie, DateProposal } from "../../constant";

export interface DashboardRoom {
    room: MovieRoom;
    host: User;
    selectedMovies: SelectedMovie[];
    selectedDate: DateProposal | null;
}

/**
 * Fetches all rooms where user is a participant along with host, selected movies, and selected date.
 * Performs queries in batched operations.
 */
export async function fetchDashboardRooms(
    supabase: SupabaseClient,
    userId: string
): Promise<DashboardRoom[]> {
    const { data: participants, error: participantsError } = await supabase
        .from("movie_room_participants")
        .select("room_id,movie_room (id,title,venue,invite_code,created_at,host_id,selected_date_id)")
        .eq("user_id", userId);

    if (participantsError || !participants) {
        console.error("fetchDashboardRooms — participants error:", participantsError);
        return [];
    }

    const allRooms: MovieRoom[] = participants.flatMap((participant) => {
        const roomData = Array.isArray(participant.movie_room)
            ? participant.movie_room[0]
            : participant.movie_room;
        if (!roomData) return [];
        return [{
            id: roomData.id,
            title: roomData.title,
            venue: roomData.venue,
            invite_code: roomData.invite_code,
            created_at: roomData.created_at,
            host_id: roomData.host_id,
            selected_date_id: roomData.selected_date_id,
        }];
    });

    if (allRooms.length === 0) {
        return [];
    }

    const hostIds = [...new Set(allRooms.map((r) => r.host_id))];
    const roomIds = allRooms.map((r) => r.id);
    const selectedDateIds = allRooms.map((r) => r.selected_date_id).filter(Boolean) as string[];

    const [hostsResult, moviesResult, datesResult] = await Promise.all([
        supabase.from("users").select("id,username,avatar,created_at").in("id", hostIds),
        supabase.from("selected_movies").select("room_id,movie_proposal_id,position").in("room_id", roomIds).order("position", { ascending: true }),
        selectedDateIds.length > 0
            ? supabase.from("date_proposals").select("*").in("id", selectedDateIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (hostsResult.error) console.error("fetchDashboardRooms — hosts error:", hostsResult.error);
    if (moviesResult.error) console.error("fetchDashboardRooms — movies error:", moviesResult.error);
    if (datesResult.error) console.error("fetchDashboardRooms — dates error:", datesResult.error);

    const hostsById = Object.fromEntries((hostsResult.data ?? []).map((h) => [h.id, h]));
    const moviesByRoom = (moviesResult.data ?? []).reduce<Record<string, SelectedMovie[]>>((acc, m) => {
        (acc[m.room_id] ??= []).push(m as SelectedMovie);
        return acc;
    }, {});
    const datesById = Object.fromEntries((datesResult.data ?? []).map((d) => [d.id, d]));

    return allRooms.flatMap((room) => {
        const host = hostsById[room.host_id];
        if (!host) return [];
        return [{
            room,
            host: host as User,
            selectedMovies: moviesByRoom[room.id] ?? [],
            selectedDate: room.selected_date_id ? (datesById[room.selected_date_id] as DateProposal ?? null) : null,
        }];
    });
}
