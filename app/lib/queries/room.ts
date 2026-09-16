import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    MovieRoom,
    User,
    MovieRoomParticipantWithUser,
    MovieProposalWithUser,
    DateProposalWithUser,
} from "../../constant";
import { fetchMovieProposalsWithVotes } from "./movies";
import { fetchDateProposalsWithVotes } from "./dates";

export interface RoomWithHost {
    room: MovieRoom;
    host: User;
}

export interface FullRoomBundle {
    room: MovieRoom;
    host: User;
    crew: MovieRoomParticipantWithUser[];
    movieProposals: MovieProposalWithUser[];
    movieVotedIds: string[];
    dateProposals: DateProposalWithUser[];
    dateVotedIds: string[];
}

/**
 * Fetches a room by invite code and its host user.
 */
export async function fetchRoomWithHost(
    supabase: SupabaseClient,
    inviteCode: string
): Promise<RoomWithHost | null> {
    const { data: roomData, error: roomError } = await supabase
        .from("movie_room")
        .select(`
            id,
            title,
            venue,
            invite_code,
            created_at,
            host_id,
            selected_date_id,
            users!host_id (
                id,
                username,
                avatar,
                created_at
            )
        `)
        .eq("invite_code", inviteCode)
        .single();

    if (roomError || !roomData) {
        // Fallback if users!host_id explicit reference is not supported by schema name
        const { data: fallbackRoom, error: fallbackError } = await supabase
            .from("movie_room")
            .select("*")
            .eq("invite_code", inviteCode)
            .single();

        if (fallbackError || !fallbackRoom) {
            console.error("fetchRoomWithHost error:", roomError || fallbackError);
            return null;
        }

        const { data: hostData, error: hostError } = await supabase
            .from("users")
            .select("*")
            .eq("id", fallbackRoom.host_id)
            .single();

        if (hostError || !hostData) {
            console.error("fetchRoomWithHost — host error:", hostError);
            return null;
        }

        return {
            room: fallbackRoom as MovieRoom,
            host: hostData as User,
        };
    }

    const hostData = Array.isArray(roomData.users) ? roomData.users[0] : roomData.users;
    const room: MovieRoom = {
        id: roomData.id,
        title: roomData.title,
        venue: roomData.venue,
        invite_code: roomData.invite_code,
        created_at: roomData.created_at,
        host_id: roomData.host_id,
        selected_date_id: roomData.selected_date_id,
    };

    return { room, host: hostData as User };
}

/**
 * Fetches all participants with their user profile for a room.
 */
export async function fetchParticipants(
    supabase: SupabaseClient,
    roomId: string
): Promise<MovieRoomParticipantWithUser[]> {
    const { data, error } = await supabase
        .from("movie_room_participants")
        .select("room_id,user_id,role,users(id,username,avatar,created_at)")
        .eq("room_id", roomId);

    if (error || !data) {
        console.error("fetchParticipants error:", error);
        return [];
    }

    return data.map((member) => ({
        room_id: member.room_id,
        user_id: member.user_id,
        role: member.role,
        users: (Array.isArray(member.users)
            ? member.users[0]
            : member.users) as User,
    }));
}

/**
 * Fetches the entire room bundle in 2 parallel steps without PostgREST relationship ambiguity.
 */
export async function fetchFullRoomBundle(
    supabase: SupabaseClient,
    inviteCode: string,
    currentUserId?: string
): Promise<FullRoomBundle | null> {
    const roomWithHost = await fetchRoomWithHost(supabase, inviteCode);
    if (!roomWithHost) return null;

    const { room, host } = roomWithHost;

    const [crew, moviesResult, datesResult] = await Promise.all([
        fetchParticipants(supabase, room.id),
        fetchMovieProposalsWithVotes(supabase, room.id, currentUserId),
        fetchDateProposalsWithVotes(supabase, room.id, currentUserId),
    ]);

    return {
        room,
        host,
        crew,
        movieProposals: moviesResult.proposals,
        movieVotedIds: moviesResult.votedIds,
        dateProposals: datesResult.proposals,
        dateVotedIds: datesResult.votedIds,
    };
}

/**
 * Fetches the room id and host_id for a given invite_code.
 * Lightweight variant used by client components that only need the IDs.
 */
export async function fetchRoomMeta(
    supabase: SupabaseClient,
    inviteCode: string
): Promise<{ id: string; host_id: string } | null> {
    const { data, error } = await supabase
        .from("movie_room")
        .select("id,host_id")
        .eq("invite_code", inviteCode)
        .single();

    if (error || !data) {
        console.error("fetchRoomMeta error:", error);
        return null;
    }
    return data;
}
