import type { SupabaseClient } from "@supabase/supabase-js";
import type { MovieRoom, User, SelectedMovie, DateProposal } from "../../constant";

export interface DashboardRoom {
    room: MovieRoom;
    host: User;
    selectedMovies: SelectedMovie[];
    selectedDate: DateProposal | null;
    participants:number,
}

interface ParticipantWithRoom {
    room_id: string;
    movie_room: MovieRoom | MovieRoom[] | null;
}

interface ParticipantCountRow {
    room_id: string;
}

/**
 * Fetches all rooms where user is a participant along with host, selected movies, and selected date.
 * Performs queries in batched operations.
 */
export async function fetchDashboardRooms(
    supabase: SupabaseClient,
    userId: string
): Promise<DashboardRoom[]> {
    const { data: rawParticipants, error: participantsError } = await supabase
        .from("movie_room_participants")
        .select("room_id,movie_room (id,title,venue,invite_code,created_at,host_id,selected_date_id)")
        .eq("user_id", userId);

    if (participantsError || !rawParticipants) {
        console.error("fetchDashboardRooms — participants error:", participantsError);
        return [];
    }

    const participants = rawParticipants as unknown as ParticipantWithRoom[];

    const allRooms: MovieRoom[] = participants.flatMap((participant: ParticipantWithRoom) => {
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
            date_voting_active: roomData.date_voting_active,
        }];
    });

    if (allRooms.length === 0) {
        return [];
    }

    const hostIds = [...new Set(allRooms.map((r) => r.host_id))];
    const roomIds = allRooms.map((r) => r.id);
    const selectedDateIds = allRooms.map((r) => r.selected_date_id).filter(Boolean) as string[];

    const [hostsResult, moviesResult, datesResult, participantsResult] = await Promise.all([
        supabase.from("users").select("id,username,avatar,created_at").in("id", hostIds),
        supabase.from("selected_movies").select("room_id,movie_proposal_id,position").in("room_id", roomIds).order("position", { ascending: true }),
        selectedDateIds.length > 0
            ? supabase.from("date_proposals").select("*").in("id", selectedDateIds)
            : Promise.resolve({ data: [], error: null }),
        supabase.from("movie_room_participants").select("room_id").in("room_id", roomIds),
    ]);

    if (hostsResult.error) console.error("fetchDashboardRooms — hosts error:", hostsResult.error);
    if (moviesResult.error) console.error("fetchDashboardRooms — movies error:", moviesResult.error);
    if (datesResult.error) console.error("fetchDashboardRooms — dates error:", datesResult.error);
    if (participantsResult.error) console.error("fetchDashboardRooms — participants error:", participantsResult.error);

    const hostsData = (hostsResult.data ?? []) as User[];
    const moviesData = (moviesResult.data ?? []) as SelectedMovie[];
    const datesData = (datesResult.data ?? []) as DateProposal[];
    const participantsData = (participantsResult.data ?? []) as ParticipantCountRow[];

    const hostsById = Object.fromEntries(hostsData.map((h: User) => [h.id, h]));
    const moviesByRoom = moviesData.reduce<Record<string, SelectedMovie[]>>((acc: Record<string, SelectedMovie[]>, m: SelectedMovie) => {
        (acc[m.room_id] ??= []).push(m);
        return acc;
    }, {});
    const datesById = Object.fromEntries(datesData.map((d: DateProposal) => [d.id, d]));
    const participantsByRoom = participantsData.reduce<Record<string, number>>((acc: Record<string, number>, participant: ParticipantCountRow) => {
        acc[participant.room_id] = (acc[participant.room_id] ?? 0) + 1;
        return acc;
    }, {});

    return allRooms.flatMap((room) => {
        const host = hostsById[room.host_id] ?? {
            id: room.host_id,
            username: "Gospodarz",
            avatar: undefined,
            created_at: room.created_at,
        };
        return [{
            room,
            host: host as User,
            selectedMovies: moviesByRoom[room.id] ?? [],
            selectedDate: room.selected_date_id ? (datesById[room.selected_date_id] ?? null) : null,
            participants: participantsByRoom[room.id] ?? 0,
        }];
    });
}

