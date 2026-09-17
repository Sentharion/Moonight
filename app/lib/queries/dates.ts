import type { SupabaseClient } from "@supabase/supabase-js";
import type { DateProposalWithUser, User, DateVote } from "../../constant";

export interface DateProposalsResult {
    proposals: DateProposalWithUser[];
    /** IDs of proposals the given userId has voted on. Empty when userId is omitted. */
    votedIds: string[];
}

interface DateProposalRow {
    id: string;
    room_id: string;
    proposed_by: string;
    date: string;
    created_at: string;
    users: User | User[];
    date_vote?: DateVote | DateVote[] | null;
}

/**
 * Fetches all date proposals for a room with their votes in a single query.
 */
export async function fetchDateProposalsWithVotes(
    supabase: SupabaseClient,
    roomId: string,
    userId?: string
): Promise<DateProposalsResult> {
    const { data: dateProposals, error: proposalsError } = await supabase
        .from("date_proposals")
        .select(`
            id,
            room_id,
            proposed_by,
            date,
            created_at,
            users (
                id,
                username,
                avatar,
                created_at
            ),
            date_vote (
                id,
                date_proposal_id,
                user_id,
                created_at
            )
        `)
        .eq("room_id", roomId)
        .order("date", { ascending: true });

    if (proposalsError || !dateProposals) {
        console.error("fetchDateProposalsWithVotes — proposals error:", proposalsError);
        return { proposals: [], votedIds: [] };
    }

    const votedIds: string[] = [];

    const proposals: DateProposalWithUser[] = (dateProposals as unknown as DateProposalRow[]).map((date) => {
        const proposer = Array.isArray(date.users) ? date.users[0] : date.users;
        const votes: DateVote[] = Array.isArray(date.date_vote)
            ? date.date_vote
            : date.date_vote
            ? [date.date_vote]
            : [];

        if (userId && votes.some((v) => v?.user_id === userId)) {
            votedIds.push(date.id);
        }

        return {
            id: date.id,
            room_id: date.room_id,
            proposed_by: date.proposed_by,
            date: date.date,
            created_at: date.created_at,
            proposer: proposer as User,
            votes: votes.length,
        };
    });

    return { proposals, votedIds };
}
