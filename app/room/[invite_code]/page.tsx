import HubPoster from "./components/HubPoster";
import MoviePropositions from "./components/MoviePropositions";
import DatePropositions from "./components/DatePropositions";
import Crew from "./components/Crew";
import { createClient } from "../../lib/supabase/server";
import { fetchFullRoomBundle } from "../../lib/queries/room";
import { ensureUserProfile } from "../../lib/queries/user";

interface RoomPageProps {
    params: Promise<{
        invite_code: string;
    }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { invite_code } = await params;
    const supabase = await createClient();

    // Get current user server-side so we can pass userId for vote state
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user ?? null;
    const currentUserId = currentUser?.id ?? undefined;

    // Ensure profile exists in public.users for the current user
    if (currentUser) {
        await ensureUserProfile(supabase, currentUser);
    }

    // 1 single database request for all room data (room, host, crew, movies, dates, votes)
    const bundle = await fetchFullRoomBundle(supabase, invite_code, currentUserId);

    // Debug: log what we got for crew
    console.log("[RoomPage] crew raw:", JSON.stringify(bundle?.crew ?? null, null, 2));
    console.log("[RoomPage] host:", JSON.stringify(bundle?.host ?? null));

    if (!bundle || !bundle.host) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="vhs-badge text-red-500">
                    Nie znaleziono pokoju lub gospodarza.
                </div>
            </div>
        );
    }

    const { room, host, crew, movieProposals: movies, dateProposals: dates } = bundle;
    const isHost = Boolean(currentUserId && currentUserId === room.host_id);

    const leading = movies.length > 0 ? movies.reduce(
        (prev, current) => (current.votes > prev.votes ? current : prev),
    ) : null;

    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5">
            <HubPoster room={room} host={host} crew={crew} leading={leading} />
            <MoviePropositions movies={movies} inviteCode={invite_code} />
            <DatePropositions dates={dates} inviteCode={invite_code}/>
            <Crew crew={crew} inviteCode={invite_code} currentUserId={currentUserId} />
        </div>
    );
}