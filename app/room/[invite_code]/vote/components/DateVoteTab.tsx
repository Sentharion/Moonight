"use client";

import { useState } from "react";
import type { DateProposalWithUser, User } from "../../../../constant";
import Bar from "../../components/Bar";
import DatePicker from "./DatePicker";
import { dateStringFormat } from "../../../../utils/dateFormat";
import { X } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { useRoomData } from "../../RoomDataContext";

interface DateVoteTabProps {
    inviteCode: string;
}

const DateVoteTab = ({ inviteCode }: DateVoteTabProps) => {
    const supabase = createClient();
    const {
        loading,
        error: contextError,
        roomId,
        currentUserId,
        isHost,
        dateProposals: datePropList,
        votedDates: votedDate,
        addDateProposalState,
        removeDateProposalState,
        setVotedDatesState: setVotedDate,
        setDateProposalsState: setDatePropList,
    } = useRoomData();

    const [showDateForm, setShowDateForm] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [voteEnd, setVoteEnd] = useState(false);

    const maxDateProp = datePropList.length > 0 ? Math.max(...datePropList.map((d) => d.votes)) : 0;
    const error = actionError || contextError;

    const addDateProp = async (date: Date, time: string) => {
        if (!roomId || !currentUserId || actionLoading) return;
        setActionLoading(true);
        setActionError("");

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
            setActionError("⚠ Błąd przy dodawaniu propozycji daty");
            setActionLoading(false);
            return;
        }

        const proposer = Array.isArray(data.users) ? data.users[0] : data.users;

        const newDate: DateProposalWithUser = {
            id: data.id,
            room_id: data.room_id,
            proposed_by: data.proposed_by,
            date: data.date,
            created_at: data.created_at,
            proposer: proposer as User,
            votes: 0,
        };

        addDateProposalState(newDate);
        setShowDateForm(false);
        setActionLoading(false);
    };

    const handleVote = async (id: string) => {
        if (deleteMode || !currentUserId || actionLoading) return;
        setActionLoading(true);
        setActionError("");

        const alreadyVoted = votedDate.includes(id);

        if (alreadyVoted) {
            const { error: deleteError } = await supabase
                .from("date_vote")
                .delete()
                .eq("date_proposal_id", id)
                .eq("user_id", currentUserId);

            if (deleteError) {
                console.error("Nie udało się usunąć głosu:", deleteError);
                setActionError("⚠ Nie udało się usunąć głosu.");
                setActionLoading(false);
                return;
            }

            setVotedDate((prev) => prev.filter((voteId) => voteId !== id));
            setDatePropList((prev) =>
                prev.map((date) =>
                    date.id === id ? { ...date, votes: Math.max(0, date.votes - 1) } : date
                )
            );
        } else {
            const { error: insertError } = await supabase
                .from("date_vote")
                .insert({ date_proposal_id: id, user_id: currentUserId });

            if (insertError) {
                if (insertError.code === "23505") {
                    // Vote already exists in DB — toggle it off (delete) to resync
                    await supabase
                        .from("date_vote")
                        .delete()
                        .eq("date_proposal_id", id)
                        .eq("user_id", currentUserId);

                    setVotedDate((prev) => prev.filter((voteId) => voteId !== id));
                    setDatePropList((prev) =>
                        prev.map((date) =>
                            date.id === id ? { ...date, votes: Math.max(0, date.votes - 1) } : date
                        )
                    );
                    setActionLoading(false);
                    return;
                }
                console.error("Nie udało się zagłosować:", insertError);
                setActionError("⚠ Nie udało się zagłosować.");
                setActionLoading(false);
                return;
            }

            setVotedDate((prev) => [...prev, id]);
            setDatePropList((prev) =>
                prev.map((date) => (date.id === id ? { ...date, votes: date.votes + 1 } : date))
            );
        }

        setActionLoading(false);
    };

    const handleDeleteProp = async (id: string) => {
        if (!isHost || actionLoading) return;
        setActionLoading(true);
        setActionError("");

        // Delete associated votes first to satisfy foreign key constraint
        const { error: votesError } = await supabase.from("date_vote").delete().eq("date_proposal_id", id);
        if (votesError) {
            console.error("Błąd przy usuwaniu głosów dla daty:", votesError);
        }

        const { error: deleteError } = await supabase.from("date_proposals").delete().eq("id", id);

        if (deleteError) {
            console.error("Nie udało się usunąć propozycji daty:", deleteError);
            setActionError("⚠ Nie udało się usunąć propozycji daty.");
            setActionLoading(false);
            return;
        }

        removeDateProposalState(id);
        setActionLoading(false);
    };

    const toggleDeleteMode = () => {
        if (!isHost) return;
        setDeleteMode((prev) => !prev);
    };

    const endVote = () =>{
        if (!isHost) return;
        setVoteEnd((prev) => !prev);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="vhs-badge animate-pulse text-neon-blue">
                    ŁADOWANIE PROPOZYCJI DAT...
                </div>
            </div>
        );
    }

    return (
        <section>
            <div className="mb-4">
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-foreground">
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

            {error && <div className="mb-4 vhs-badge text-red-500">{error}</div>}

            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className={`uppercase vhs-badge text-neon-blue ${deleteMode ? "text-red-500" : "text-neon-blue"}`}>
                        Propozycje dat {deleteMode ? "(tryb usuwania)" : ""}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDateForm((v) => !v)}
                            className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-neon-blue/10 text-neon-blue transition-all ${
                                showDateForm ? "border-neon-blue/35 bg-neon-blue/10" : "border-neon-blue/35 bg-transparent"
                            }`}
                        >
                            {showDateForm ? "✕ Anuluj" : "+ Dodaj"}
                        </button>
                        {!showDateForm && isHost && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={endVote}
                                    className="vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-neon-blue/15 border-neon-blue bg-transparent text-neon-blue">
                                    {voteEnd ? "Wznów głosowanie" : "Zakończ głosowanie"}
                                </button>
                                <button
                                    onClick={toggleDeleteMode}
                                    className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500 ${
                                        deleteMode ? "border-red-500/35 bg-red-500/10" : "border-red-500/35 bg-transparent"
                                    }`}
                                >
                                    ✕ Usuń
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showDateForm && (
                    <div className="flex flex-col justify-center gap-2 rounded-sm border border-neon-blue/20 bg-card-bg dark:bg-[#0e0e1a] p-3">
                        <div className="flex justify-center">
                            <DatePicker onAddDate={addDateProp} showDateForm={showDateForm} />
                        </div>
                    </div>
                )}
            </div>

            {datePropList.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border bg-card-bg dark:bg-[#0e0e1a] py-8">
                    <div className="text-[28px] opacity-30">📅</div>
                    <div className="vhs-badge uppercase text-center text-text-light">
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
                                className={`w-full rounded-sm p-4 text-left transition-all duration-200 ${
                                    picked
                                        ? "border-2 border-neon-blue bg-cyan-500/10 dark:bg-[#001a20] shadow-[0_0_18px_#00e5ff25]"
                                        : leading && votedDate && !deleteMode
                                        ? "border border-neon-blue/25 bg-card-bg dark:bg-[#0e0e1a]"
                                        : "border border-border bg-card-bg dark:bg-[#0e0e1a]"
                                } ${deleteMode ? "cursor-default" : "cursor-pointer"}`}
                            >
                                <div className="mb-2.5 flex items-center justify-between">
                                    <div>
                                        <span className={`font-mono text-[14px] ${picked ? "text-neon-blue" : "text-foreground dark:text-[#e8e0ff]"}`}>
                                            {dateStringFormat(d.date)}
                                        </span>

                                        <div className="vhs-badge mt-0.5 text-text-light">
                                            proponowane przez {d.proposer?.username}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {leading && votedDate !== null && !deleteMode && (
                                            <span className="vhs-badge rounded-sm uppercase bg-neon-blue px-1.5 py-0.5 text-text-light">
                                                Wygrywa
                                            </span>
                                        )}

                                        {picked && <span className="text-neon-blue">✓</span>}

                                        {deleteMode ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProp(d.id);
                                                }}
                                                className="vhs-badge uppercase rounded-sm border py-1 px-1.5 text-center cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        ) : (
                                            <span className={`vhs-badge ${picked ? "text-neon-blue" : "text-text-light"}`}>
                                                {d.votes}
                                            </span>
                                        )}
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
                    ZAGŁOSOWANO NA —{" "}
                    {datePropList
                        .filter((d) => votedDate.includes(d.id))
                        .map((d) => dateStringFormat(d.date))
                        .join(", ")
                        .toUpperCase()}
                </div>
            )}
        </section>
    );
};

export default DateVoteTab;