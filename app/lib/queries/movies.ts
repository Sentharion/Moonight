import type { SupabaseClient } from "@supabase/supabase-js";
import type { MovieProposalWithUser, User, MovieVote } from "../../constant";

export interface MovieProposalsResult {
    proposals: MovieProposalWithUser[];
    /** IDs of proposals the given userId has voted on. Empty when userId is omitted. */
    votedIds: string[];
}

interface MovieProposalRow {
    id: string;
    room_id: string;
    proposed_by: string;
    movie_id: string;
    title: string;
    year?: string;
    poster_url?: string;
    created_at: string;
    users: User | User[];
    movie_vote?: MovieVote | MovieVote[] | null;
}

/**
 * Fetches all movie proposals for a room with their votes in a single query.
 */
export async function fetchMovieProposalsWithVotes(
    supabase: SupabaseClient,
    roomId: string,
    userId?: string
): Promise<MovieProposalsResult> {
    const { data: movieProposals, error: proposalsError } = await supabase
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
            ),
            movie_vote (
                id,
                movie_proposal_id,
                user_id,
                created_at
            )
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

    if (proposalsError || !movieProposals) {
        console.error("fetchMovieProposalsWithVotes — proposals error:", proposalsError);
        return { proposals: [], votedIds: [] };
    }

    const votedIds: string[] = [];

    const proposals: MovieProposalWithUser[] = (movieProposals as unknown as MovieProposalRow[]).map((m) => {
        const proposer = Array.isArray(m.users) ? m.users[0] : m.users;
        const votes: MovieVote[] = Array.isArray(m.movie_vote)
            ? m.movie_vote
            : m.movie_vote
            ? [m.movie_vote]
            : [];

        if (userId && votes.some((v) => v?.user_id === userId)) {
            votedIds.push(m.id);
        }

        return {
            id: m.id,
            room_id: m.room_id,
            proposed_by: m.proposed_by,
            movie_id: m.movie_id,
            title: m.title,
            year: m.year,
            poster_url: m.poster_url,
            created_at: m.created_at,
            proposer: proposer as User,
            votes: votes.length,
        };
    });

    return { proposals, votedIds };
}
