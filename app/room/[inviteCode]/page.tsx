import HubPoster from "./components/HubPoster";
import { roomsSampleData, dateSampleData } from "../../constant";
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

    const room = roomsSampleData[0];
    const dates = dateSampleData;

    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5"> 
            <HubPoster room={room} host={room.host} crew={room.crew} leading={room.leading} />
            <MoviePropositions />
            <DatePropositions dates={dates} />
            <Crew/>
        </div>
    );
}