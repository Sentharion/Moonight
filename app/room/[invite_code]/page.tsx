import HubPoster from "./components/HubPoster";
import MoviePropositions from "./components/MoviePropositions";
import DatePropositions from "./components/DatePropositions";
import Crew from "./components/Crew";
import { createClient } from "../../lib/supabase/server";
import { fetchFullRoomBundle } from "../../lib/queries/room";

interface RoomPageProps {
    params: Promise<{
        invite_code: string;
    }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { invite_code } = await params;
    const supabase = await createClient();

    // 1 single database request for all room data (room, host, crew, movies, dates, votes)
    const bundle = await fetchFullRoomBundle(supabase, invite_code);

    if (!bundle) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="vhs-badge text-red-500">
                    Nie znaleziono pokoju lub gospodarza.
                </div>
            </div>
        );
    }

    const { room, host, crew, movieProposals: movies, dateProposals: dates } = bundle;

    const leading = movies.length > 0 ? movies.reduce(
        (prev, current) => (current.votes > prev.votes ? current : prev),
    ) : null;

    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5">
            <HubPoster room={room} host={host} crew={crew} leading={leading} />
            <MoviePropositions movies={movies} inviteCode={invite_code} />
            <DatePropositions dates={dates} inviteCode={invite_code} />
            <Crew crew={crew} inviteCode={invite_code} />
        </div>
    );
}