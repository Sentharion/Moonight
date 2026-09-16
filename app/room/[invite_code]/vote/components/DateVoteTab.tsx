"use client"
import { useState, useEffect } from "react";
import { DateProposalWithUser} from "../../../../constant";
import Bar from "../../components/Bar";
import DatePicker from "./DatePicker";
import { dateStringFormat } from "../../../../utils/dateFormat";
import { X } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";

interface DateVoteTabProps {
    inviteCode: string;
}

const DateVoteTab = ({ inviteCode }: DateVoteTabProps) => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [hostId, setHostId] = useState<string | null>(null);
    const isHost = !!(currentUserId && hostId && currentUserId === hostId);
    const supabase = createClient();
    const [showDateForm, setShowDateForm] = useState(false);
    const [datePropList, setDatePropList] = useState<DateProposalWithUser[]>([]);
    const [votedDate, setVotedDate] = useState<string[]>([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);

    const maxDateProp = datePropList.length > 0 ? Math.max(...datePropList.map((d) => d.votes)) : 0;

    useEffect(() => {
        const loadDates = async () => {
            setLoading(true);

            // Resolve user and room in parallel
            const [{ data: { user }, error: authError }, { data: room, error: roomError }] = await Promise.all([
                supabase.auth.getUser(),
                supabase.from("movie_room").select("id,host_id").eq("invite_code", inviteCode).single(),
            ]);

            if (authError || !user) {
                console.error("AUTH ERROR:", authError);
                setLoading(false);
                return;
            }
            if (roomError || !room) {
                console.error("ROOM ERROR:", roomError);
                setLoading(false);
                return;
            }

            setCurrentUserId(user.id);
            setHostId(room.host_id);
            setRoomId(room.id);

            const { data: dateProposals, error: dateError } = await supabase
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
                    )
                `)
                .eq("room_id", room.id)
                .order("date", { ascending: true });

            if (dateError || !dateProposals) {
                console.error("DATE PROPOSALS ERROR:", dateError);
                setLoading(false);
                return;
            }

            const dateIds = (dateProposals ?? []).map((date) => date.id);
            let votes: { id: string; date_proposal_id: string; user_id: string }[] = [];

            if (dateIds.length > 0) {
                const { data: voteData, error: voteError } = await supabase
                    .from("date_vote")
                    .select("id,date_proposal_id,user_id,created_at")
                    .in("date_proposal_id", dateIds);
                if (voteError) {
                    console.error("DATE VOTES ERROR:", voteError);
                } else {
                    votes = voteData ?? [];
                }
            }

            const userVotes = votes
                .filter((vote) => vote.user_id === user.id)
                .map((vote) => vote.date_proposal_id);

            const formattedDates: DateProposalWithUser[] = (dateProposals ?? []).map((date) => {
                const proposer = Array.isArray(date.users) ? date.users[0] : date.users;
                return {
                    id: date.id,
                    room_id: date.room_id,
                    proposed_by: date.proposed_by,
                    date: date.date,
                    created_at: date.created_at,
                    proposer: proposer,
                    votes: votes.filter((vote) => vote.date_proposal_id === date.id).length,
                };
            });

            setDatePropList(formattedDates);
            setVotedDate(userVotes);
            setLoading(false);
        };
        loadDates();
    }, [inviteCode]);

    const addDateProp = async (date: Date, time: string) => {
        if (!roomId || !currentUserId) return;

        const [hours, minutes] = time.split(":");

        const dateTime = new Date(date);
        dateTime.setHours(Number(hours), Number(minutes), 0, 0);

        const formattedDate = dateTime.toISOString();

        const { data, error: PropError } = await supabase
            .from("date_proposals")
            .insert({
                room_id: roomId,
                proposed_by: currentUserId,
                date: formattedDate,
            })
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
                )
            `)
            .single();

        if (PropError || !data) {
            console.error("Błąd dodawania propozycji daty", PropError);
            return;
        }

        const proposer = Array.isArray(data.users) ? data.users[0] : data.users;

        const newDate: DateProposalWithUser = {
            id: data.id,
            room_id: data.room_id,
            proposed_by: data.proposed_by,
            date: data.date,
            created_at: data.created_at,
            proposer: proposer,
            votes: 0,
        };

        setDatePropList((prev) => [...prev, newDate]);
        setShowDateForm(false);
    }

    const handleVote = async (id: string) => {
        if (deleteMode) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("USER NOT LOGGED IN");
            return;
        }

        const alreadyVoted = votedDate.includes(id);

        if (alreadyVoted) {
            const { error } = await supabase.from("date_vote").delete().eq("date_proposal_id", id).eq("user_id", user.id);

            if (error) {
                console.error("Nie udało się usunąć głosu:", error);
                return;
            }

            setVotedDate((prev) => prev.filter((voteId) => voteId !== id));

            setDatePropList((prev) => prev.map((date) => date.id === id ? { ...date, votes: Math.max(0, date.votes - 1) } : date));

            return;

        } else {

            const { error } = await supabase.from("date_vote").insert({ date_proposal_id: id, user_id: user.id, });

            if (error) {
                console.error("Nie udało się zagłosować:", error);
                return;
            }

            setVotedDate((prev) => [...prev, id]);

            setDatePropList((prev) => prev.map((date) => date.id === id ? { ...date, votes: date.votes + 1 } : date));
        }

    }

    const handleDeleteProp = async (id: string) => {
        if (!isHost) return;

        const { error } = await supabase.from("date_proposals").delete().eq("id", id);

        if (error) {
            console.error("Nie udało się usunąć propozycji daty:", error);
            return;
        }

        setDatePropList((prev) => prev.filter((date) => date.id !== id));
        setVotedDate((prev) => prev.filter((dateId) => dateId !== id));
    }

    const toggleDeleteMode = () => {
        if (!isHost) return;

        setDeleteMode((prev) => !prev);
    };

    return (
        <section>
            <div className="mb-4">
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-white">
                    Wybierz{" "}
                    <span className="text-neon-blue drop-shadow-[0_0_12px_#00e5ff]">
                        Termin
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    {datePropList.length === 0
                        ? "Nie ma jeszcze zaproponowanych dat — dodaj poniżej"
                        : "Zagłosuj na termin wieczoru filmowego"}
                </div>
            </div>

            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className={`uppercase vhs-badge text-neon-blue ${deleteMode ? "text-red-500" : "text-neon-blue"}`}>
                        Propozycje dat {deleteMode ? "(tryb usuwania)" : ""}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDateForm((v) => !v)}
                            className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-neon-blue/10 text-neon-blue transition-all ${showDateForm ? "border-neon-blue/35 bg-neon-blue/10" : "border-neon-blue/35 bg-transparent"}`}
                        >
                            {showDateForm ? "✕ Anuluj" : "+ Dodaj"}
                        </button>
                        {(!showDateForm && isHost) &&
                            <button onClick={toggleDeleteMode} className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500 ${deleteMode ? "border-red-500/35 bg-red-500/10" : "border-red-500/35 bg-transparent"}`}>
                                ✕ Usuń
                            </button>
                        }
                    </div>
                </div>

                {showDateForm && (
                    <div className="flex flex-col justify-center gap-2 rounded-sm border border-neon-blue/20 bg-[#0e0e1a] p-3">
                        <div className="flex justify-center">
                            <DatePicker onAddDate={addDateProp} showDateForm={showDateForm} />
                        </div>
                    </div>
                )}
            </div>

            {datePropList.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border bg-[#0e0e1a] py-8">
                    <div className="text-[28px] opacity-30">
                        📅
                    </div>

                    <div className="vhs-badge uppercase text-center text-[#333360]">
                        Nie ma propozycji dat
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {datePropList.map((d) => {
                        const picked = votedDate.includes(d.id);
                        const leading = d.votes === maxDateProp && d.votes > 0;

                        return (
                            <div
                                key={d.id}
                                onClick={() => handleVote(d.id)}
                                className={`w-full rounded-sm p-4 text-left transition-all duration-200 ${picked ? "border-2 border-neon-blue bg-[#001a20] shadow-[0_0_18px_#00e5ff25]" : leading && votedDate && !deleteMode ? "border border-neon-blue/25 bg-[#0e0e1a]" : "border border-border bg-[#0e0e1a]"} ${deleteMode ? "cursor-default" : "cursor-pointer"}`}
                            >
                                <div className="mb-2.5 flex items-center justify-between">
                                    <div>
                                        <span className={`font-mono text-[14px] ${picked ? "text-neon-blue" : "text-[#e8e0ff]"}`}>
                                            {dateStringFormat(d.date)}
                                        </span>

                                        <div className="vhs-badge mt-0.5 text-[#333360]">
                                            proponowane przez {d.proposer?.username}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {leading && votedDate !== null && !deleteMode && (
                                            <span className="vhs-badge rounded-sm uppercase bg-neon-blue px-1.5 py-0.5 text-text-light">
                                                Wygrywa
                                            </span>
                                        )}

                                        {picked && (
                                            <span className="text-neon-blue">
                                                ✓
                                            </span>
                                        )}

                                        {
                                            deleteMode ? (
                                                <button onClick={() => handleDeleteProp(d.id)} className="vhs-badge uppercase rounded-sm border py-1 px-1.5 text-center cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500">
                                                    <X size={12} />
                                                </button>
                                            ) : (
                                                <span className={`vhs-badge ${picked ? "text-neon-blue" : "text-text-light"}`}>
                                                    {d.votes}
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>

                                <Bar
                                    val={d.votes}
                                    max={maxDateProp || 1}
                                    color={picked ? "#00e5ff" : "#1a1a40"}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {votedDate.length > 0 && (
                <div className="mt-4 rounded-sm border border-neon-blue/25 bg-neon-blue/5 p-3 text-center vhs-badge text-neon-blue">
                    ZAGŁOSOWANO NA — {datePropList
                        .filter((d) => votedDate.includes(d.id))
                        .map((d) => dateStringFormat(d.date))
                        .join(", ")
                        .toUpperCase()}
                </div>
            )}
        </section>
    )
}

export default DateVoteTab