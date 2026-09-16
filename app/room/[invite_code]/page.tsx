import HubPoster from "./components/HubPoster";
import { MovieRoom, User, MovieProposalWithUser, DateProposalWithUser, MovieRoomParticipantWithUser } from "../../constant";
import MoviePropositions from "./components/MoviePropositions";
import DatePropositions from "./components/DatePropositions";
import Crew from "./components/Crew";
import { createClient } from "../../lib/supabase/server";


interface RoomPageProps {
    params: Promise<{
        invite_code: string;
    }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { invite_code } = await params
    const supabase = await createClient();
    const { data: roomData, error: roomError } = await supabase.from("movie_room").select("*").eq("invite_code", invite_code).single();

    console.log("INVITE CODE:", invite_code);
    console.log("ROOM DATA:", roomData);
    console.log("ROOM ERROR:", roomError);

    if (roomError || !roomData) {
        console.error("ROOM ERROR:", roomError);
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="vhs-badge text-red-500">
                    Nie znaleziono pokoju.
                </div>
            </div>
        );
    }

    const room: MovieRoom = {
        id: roomData.id,
        title: roomData.title,
        venue: roomData.venue,
        invite_code: roomData.invite_code,
        created_at: roomData.created_at,
        host_id: roomData.host_id,
        selected_date_id: roomData.selected_date_id,
    };

    const { data: hostData, error: hostError } = await supabase.from("users").select("*").eq("id", room.host_id).single();

    if (hostError || !hostData) {
        console.error("HOST ERROR:", hostError);
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="vhs-badge text-red-500">
                    Nie znaleziono gospodarza.
                </div>
            </div>
        );
    }

    const host = hostData as User;

    const { data: participants, error: participantsError } = await supabase.from("movie_room_participants").select(`room_id,user_id,role,users(id,username,avatar,created_at)`).eq("room_id", room.id);
    if (participantsError || !participants) {
        console.error("PARTICIPANTS ERROR:", participantsError);
    }
    const crew: MovieRoomParticipantWithUser[] = (participants ?? []).map(
        (member) => ({
            room_id: member.room_id,
            user_id: member.user_id,
            role: member.role,
            users: Array.isArray(member.users)
                ? member.users[0] as User
                : member.users as User,
        })
    );

    const { data: moviePropositions, error: moviePropositionsError } =
        await supabase
            .from("movie_proposals")
            .select(`
            id,
            room_id,
            proposed_by,
            movie_id,
            title,
            year,
            poster_url,
            created_at,
            users (
                id,
                username,
                avatar,
                created_at
            )
        `)
            .eq("room_id", room.id);

    if (moviePropositionsError || !moviePropositions) {
        console.error("MOVIE PROPOSITIONS ERROR:", moviePropositionsError);
    }
    const movieIds = (moviePropositions ?? []).map((movie) => movie.id);

    let movieVotes: { movie_proposal_id: string }[] = [];

    if (movieIds.length > 0) {
        const { data, error } = await supabase
            .from("movie_vote")
            .select("movie_proposal_id")
            .in("movie_proposal_id", movieIds);

        if (error || !data) {
            console.error("MOVIE VOTES ERROR:", error);
        } else {
            movieVotes = data ?? [];
        }
    }

    const movies: MovieProposalWithUser[] = (moviePropositions ?? []).map(
        (movie) => {
            const proposer = Array.isArray(movie.users)
                ? movie.users[0]
                : movie.users;

            return {
                id: movie.id,
                room_id: movie.room_id,
                proposed_by: movie.proposed_by,
                movie_id: movie.movie_id,
                title: movie.title,
                year: movie.year,
                poster_url: movie.poster_url,
                created_at: movie.created_at,

                proposer: proposer as User,

                votes: movieVotes.filter((vote) => vote.movie_proposal_id === movie.id).length,
            };
        }
    );

    const { data: dateProposals, error: dateError } = await supabase.from("date_proposals").select(`
            id,
            room_id,
            proposed_by,
            date,
            created_at,
            users (
                username
            )
        `).eq("room_id", room.id).order("date", { ascending: true });
    if (dateError || !dateProposals) {
        console.error("DATE PROPOSITIONS ERROR:", dateError);
    }

    const dateIds = (dateProposals ?? []).map((date) => date.id);

    let dateVotes: { date_proposal_id: string }[] = [];

    if (dateIds.length > 0) {
        const { data, error } = await supabase
            .from("date_vote")
            .select("date_proposal_id")
            .in("date_proposal_id", dateIds);

        if (error || !data) {
            console.error("DATE VOTES ERROR:", error);
        } else {
            dateVotes = data ?? [];
        }
    }

    const dates: DateProposalWithUser[] = (dateProposals ?? []).map((date) => {
        const proposer = Array.isArray(date.users)
            ? date.users[0]
            : date.users;

        return {
            id: date.id,
            room_id: date.room_id,
            proposed_by: date.proposed_by,
            date: date.date,
            created_at: date.created_at,
            proposer: proposer as User,

            votes: dateVotes.filter(
                (vote) => vote.date_proposal_id === date.id
            ).length,
        };
    });

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