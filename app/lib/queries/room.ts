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
 * Always performs a direct lookup of the host from public.users,
 * independent of whether the current viewer is the host.
 */
export async function fetchRoomWithHost(
    supabase: SupabaseClient,
    inviteCode: string
): Promise<RoomWithHost | null> {
    // Step 1: Get the room record
    const { data: roomData, error: roomError } = await supabase
        .from("movie_room")
        .select("id, title, venue, invite_code, created_at, host_id, selected_date_id")
        .eq("invite_code", inviteCode)
        .single();

    if (roomError || !roomData) {
        console.error("fetchRoomWithHost error:", roomError);
        return null;
    }

    const room: MovieRoom = roomData as MovieRoom;

    // Step 2: Always look up the host directly from public.users (never relies on auth session)
    const { data: hostRow, error: hostError } = await supabase
        .from("users")
        .select("id, username, avatar, created_at")
        .eq("id", room.host_id)
        .maybeSingle();

    if (hostError) {
        console.error("fetchRoomWithHost — host lookup error:", hostError);
    }

    const host: User = (hostRow && hostRow.username)
        ? (hostRow as User)
        : { id: room.host_id, username: "Gospodarz", avatar: undefined, created_at: room.created_at };

    return { room, host };
}

/**
 * Fetches all participants with their user profile for a room.
 * Falls back to a batch direct lookup for any members whose PostgREST join returned null,
 * so crew always shows real usernames regardless of who is logged in.
 */
export async function fetchParticipants(
    supabase: SupabaseClient,
    roomId: string
): Promise<MovieRoomParticipantWithUser[]> {
    const { data, error } = await supabase
        .from("movie_room_participants")
        .select("room_id, user_id, role, users(id, username, avatar, created_at)")
        .eq("room_id", roomId);

    if (error || !data) {
        console.error("fetchParticipants error:", error);
        return [];
    }

    interface RawParticipantRow {
        room_id: string;
        user_id: string;
        role: "host" | "participant";
        users: User | User[] | null;
    }

    const participantsData = data as unknown as RawParticipantRow[];

    // Find members whose user join returned null or empty
    const missingUserIds = participantsData
        .filter((member: RawParticipantRow) => {
            const userObj = Array.isArray(member.users) ? member.users[0] : member.users;
            return !userObj || !(userObj as User).username;
        })
        .map((member: RawParticipantRow) => member.user_id);

    // Batch-fetch missing profiles directly from public.users
    const fallbackById: Record<string, User> = {};
    if (missingUserIds.length > 0) {
        const { data: fallbackUsers } = await supabase
            .from("users")
            .select("id, username, avatar, created_at")
            .in("id", missingUserIds);

        for (const u of (fallbackUsers ?? []) as User[]) {
            fallbackById[u.id] = u as User;
        }
    }

    return participantsData.map((member: RawParticipantRow) => {
        const userObj = (Array.isArray(member.users) ? member.users[0] : member.users) as User | null;
        const resolvedUser: User = (userObj && userObj.username)
            ? userObj
            : (fallbackById[member.user_id] ?? {
                id: member.user_id,
                username: member.role === "host" ? "Gospodarz" : "Użytkownik",
                avatar: undefined,
                created_at: "",
            });

        return {
            room_id: member.room_id,
            user_id: member.user_id,
            role: member.role,
            users: resolvedUser,
        };
    });
}

/**
 * Fetches the entire room bundle: room, host, crew, movie proposals and date proposals.
 * Host is always guaranteed to appear in the crew list.
 */
export async function fetchFullRoomBundle(
    supabase: SupabaseClient,
    inviteCode: string,
    currentUserId?: string
): Promise<FullRoomBundle | null> {
    const roomWithHost = await fetchRoomWithHost(supabase, inviteCode);
    if (!roomWithHost) return null;

    const { room, host } = roomWithHost;

    const [rawCrew, moviesResult, datesResult] = await Promise.all([
        fetchParticipants(supabase, room.id),
        fetchMovieProposalsWithVotes(supabase, room.id, currentUserId),
        fetchDateProposalsWithVotes(supabase, room.id, currentUserId),
    ]);

    // Ensure host is always present in crew with their real profile
    const crew = [...rawCrew];
    const hostInCrewIndex = crew.findIndex((member) => member.user_id === room.host_id);

    if (hostInCrewIndex === -1) {
        // Host has no participant row — add them at the top
        crew.unshift({
            room_id: room.id,
            user_id: room.host_id,
            role: "host",
            users: host,
        });
    } else {
        // Host row exists but might have a stale/empty profile from the join — always use real host data
        crew[hostInCrewIndex] = {
            ...crew[hostInCrewIndex],
            role: "host",
            users: (crew[hostInCrewIndex].users?.username && crew[hostInCrewIndex].users.username !== "Gospodarz")
                ? crew[hostInCrewIndex].users
                : host,
        };
    }

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
