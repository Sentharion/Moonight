import HubPoster from "./components/HubPoster";
import { roomsSampleData, dateSampleData, propositionsSampleData } from "../../constant";
import MoviePropositions from "./components/MoviePropositions";
import DatePropositions from "./components/DatePropositions";
import Crew from "./components/Crew";


interface RoomPageProps {
    params: Promise<{
        inviteCode: string;
    }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { inviteCode } = await params;

    const room = roomsSampleData.find(r => r.inviteCode === inviteCode)

    if (!room) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="vhs-badge text-red-500">
                    Nie znaleziono pokoju.
                </div>
            </div>
        );
    }
     const datePropositions = dateSampleData.filter(
        (date) => date.roomId === room.id
    );
    const moviePropositions = propositionsSampleData.filter(p => p.roomId === room.id);

    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5"> 
            <HubPoster room={room} host={room.host} crew={room.crew} leading={room.leading} />
            <MoviePropositions movies={moviePropositions} inviteCode={inviteCode}/>
            <DatePropositions dates={datePropositions} inviteCode={inviteCode}/>
            <Crew/>
        </div>
    );
}