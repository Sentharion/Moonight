"use client";

import Bar from "../../components/Bar";
import { MovieProposalWithUser, ReelDBMovie, User } from "../../../../constant";
import { useState } from "react";
import Image from "next/image";
import MoviePicker from "./MoviePicker";
import { X } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { useRoomData } from "../../RoomDataContext";
import { useTheme } from "@/app/providers/ThemeProvider";

interface MovieVoteTabProps {
    inviteCode: string;
}

const MovieVoteTab = ({ inviteCode }: MovieVoteTabProps) => {
    const supabase = createClient();
    const {
        loading,
        error: contextError,
        roomId,
        currentUserId,
        isHost,
        movieProposals: propositions,
        votedMovies: votedProp,
        addMovieProposalState,
        removeMovieProposalState,
        setVotedMoviesState: setVotedProp,
        setMovieProposalsState: setPropositions,
    } = useRoomData();

    const [showPropForm, setShowPropForm] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<ReelDBMovie | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const { theme, toggleTheme } = useTheme();
    const lightMode = theme === "light";

    const error = actionError || contextError;

    const addProposition = async () => {
        if (!selectedMovie || !currentUserId || !roomId || actionLoading) {
            return;
        }
        setActionLoading(true);
        setActionError("");

        const { data: newMovie, error: insertError } = await supabase
            .from("movie_proposals")
            .insert({
                room_id: roomId,
                proposed_by: currentUserId,
                movie_id: selectedMovie.imdbID,
                title: selectedMovie.Title,
                year: selectedMovie.Year,
                poster_url: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null,
            })
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
            .single();

        if (insertError) {
            console.error("Błąd przy dodawaniu propozycji filmu:", insertError);
            setActionError("⚠ Nie udało się dodać propozycji filmu.");
            setActionLoading(false);
            return;
        }

        const proposer = Array.isArray(newMovie.users) ? newMovie.users[0] : newMovie.users;

        const newProposition: MovieProposalWithUser = {
            id: newMovie.id,
            room_id: newMovie.room_id,
            proposed_by: newMovie.proposed_by,
            movie_id: newMovie.movie_id,
            title: newMovie.title,
            year: newMovie.year,
            poster_url: newMovie.poster_url,
            created_at: newMovie.created_at,
            proposer: proposer as User,
            votes: 0,
        };

        addMovieProposalState(newProposition);
        setSelectedMovie(null);
        setShowPropForm(false);
        setActionLoading(false);
    };

    const handleVote = async (id: string) => {
        if (deleteMode || !currentUserId || actionLoading) return;

        setActionLoading(true);
        setActionError("");

        const alreadyVoted = votedProp.includes(id);

        if (alreadyVoted) {
            const { error: deleteError } = await supabase
                .from("movie_vote")
                .delete()
                .eq("movie_proposal_id", id)
                .eq("user_id", currentUserId);

            if (deleteError) {
                console.error("Błąd przy usuwaniu głosu:", deleteError);
                setActionError("⚠ Nie udało się usunąć głosu.");
                setActionLoading(false);
                return;
            }

            setVotedProp((prev) => prev.filter((voteId) => voteId !== id));
            setPropositions((prev) =>
                prev.map((movie) =>
                    movie.id === id ? { ...movie, votes: Math.max(0, movie.votes - 1) } : movie
                )
            );
        } else {
            const { error: insertError } = await supabase
                .from("movie_vote")
                .insert({ movie_proposal_id: id, user_id: currentUserId });

            if (insertError) {
                if (insertError.code === "23505") {
                    // Vote already exists in DB — toggle it off (delete) to resync
                    await supabase
                        .from("movie_vote")
                        .delete()
                        .eq("movie_proposal_id", id)
                        .eq("user_id", currentUserId);

                    setVotedProp((prev) => prev.filter((voteId) => voteId !== id));
                    setPropositions((prev) =>
                        prev.map((movie) =>
                            movie.id === id ? { ...movie, votes: Math.max(0, movie.votes - 1) } : movie
                        )
                    );
                    setActionLoading(false);
                    return;
                }
                console.error("Błąd przy dodawaniu głosu:", insertError);
                setActionError("⚠ Nie udało się dodać głosu.");
                setActionLoading(false);
                return;
            }

            setVotedProp((prev) => [...prev, id]);
            setPropositions((prev) =>
                prev.map((movie) =>
                    movie.id === id ? { ...movie, votes: movie.votes + 1 } : movie
                )
            );
        }

        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!isHost || actionLoading) {
            return;
        }

        setActionLoading(true);
        setActionError("");

        // Delete associated votes first to satisfy foreign key constraint
        const { error: votesError } = await supabase.from("movie_vote").delete().eq("movie_proposal_id", id);
        if (votesError) {
            console.error("Błąd przy usuwaniu głosów dla filmu:", votesError);
        }

        const { error: deleteError } = await supabase.from("movie_proposals").delete().eq("id", id);

        if (deleteError) {
            console.error("Błąd przy usuwaniu propozycji filmu:", deleteError);
            setActionError("⚠ Nie udało się usunąć propozycji filmu.");
            setActionLoading(false);
            return;
        }

        removeMovieProposalState(id);
        setActionLoading(false);
    };

    const toggleDeleteMode = () => {
        if (!isHost) return;
        setDeleteMode((prev) => !prev);
        setShowPropForm(false);
    };

    const maxProp = propositions.length > 0 ? Math.max(...propositions.map((p) => p.votes)) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="vhs-badge animate-pulse dark:text-neon-lime text-neon-purple">
                    ŁADOWANIE PROPOZYCJI FILMÓW...
                </div>
            </div>
        );
    }

    return (
        <section>
            <div className="mb-4">
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-foreground">
                    Co{" "}
                    <span className="dark:text-neon-lime text-neon-purple dark:drop-shadow-[0_0_12px_#9eff2d] drop-shadow-[0_0_12px_#bf5fff] drop-shadow-[0_0_12px_#bf5fff]">
                        oglądamy?
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    {propositions.length === 0
                        ? "Nie wybrano żadnych filmów - dodaj jeden poniżej"
                        : "Zagłosuj na film który obejrzymy"}
                </div>
            </div>

            {error && <div className="mb-4 vhs-badge text-red-500">{error}</div>}

            {/* Propose form */}
            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className={`uppercase vhs-badge ${deleteMode ? "text-red-500" : "dark:text-neon-lime text-neon-purple"}`}>
                        Propozycje filmów {deleteMode ? "(tryb usuwania)" : ""}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPropForm(!showPropForm)}
                            className={`vhs-badge cursor-pointer rounded-sm border px-2.5 py-1 transition-all ${showPropForm
                                ? "dark:border-neon-lime/35 bg-neon-lime/10 dark:text-neon-lime text-neon-purple dark:hover:bg-neon-lime/15 hover:border-neon-purple/35 hover:bg-neon-purple/10"
                                : "dark:border-neon-lime/35 bg-transparent dark:text-neon-lime text-neon-purple dark:hover:bg-neon-lime/10 hover:border-neon-purple/35 hover:bg-neon-purple/10"
                                }`}
                        >
                            {showPropForm ? "✕ ANULUJ" : "+ DODAJ"}
                        </button>
                        {!showPropForm && isHost && (
                            <button
                                onClick={toggleDeleteMode}
                                className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500 ${deleteMode ? "border-red-500/35 bg-red-500/10" : "border-red-500/35 bg-transparent"
                                    }`}
                            >
                                ✕ Usuń
                            </button>
                        )}
                    </div>
                </div>

                {showPropForm && (
                    <div className="flex flex-col gap-2 rounded-sm border border-neon-lime/20 bg-card-bg dark:bg-[#0e0e1a] p-3">
                        <MoviePicker onSelectMovie={(movie) => setSelectedMovie(movie)} />
                        {selectedMovie && (
                            <button
                                type="button"
                                onClick={addProposition}
                                disabled={actionLoading}
                                className="vhs-badge rounded-sm border border-neon-lime/40 bg-neon-lime/10 px-3 py-2 dark:text-neon-lime text-neon-purple transition hover:bg-neon-lime/20 disabled:opacity-50"
                            >
                                + DODAJ FILM DO PROPOZYCJI
                            </button>
                        )}
                    </div>
                )}
            </div>

            {propositions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border bg-card-bg dark:bg-[#0e0e1a] py-10">
                    <div className="text-[32px] opacity-30">🎬</div>
                    <div className="vhs-badge text-center uppercase text-text-light">
                        Nie ma propozycji filmów
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {propositions.map((p) => {
                        const picked = votedProp.includes(p.id);
                        const leading = p.votes === maxProp && p.votes > 0;

                        return (
                            <div
                                key={p.id}
                                onClick={() => handleVote(p.id)}
                                className={`w-full overflow-hidden rounded-sm text-left transition-all duration-200 ${picked
                                    ? "border-2 dark:border-neon-lime border-neon-purple dark:bg-neon-lime/10 bg-neon-purple/10 shadow-[0_0_18px_#9eff2d40]"
                                    : leading && votedProp.length > 0
                                        ? "border dark:border-neon-lime/25 border-neon-purple/25 bg-card-bg dark:bg-transparent"
                                        : "border border-border bg-card-bg dark:bg-transparent"
                                    } ${deleteMode ? "cursor-default" : "cursor-pointer"}`}
                            >
                                <div className="flex items-stretch gap-0">
                                    {/* Poster */}
                                    <div className="w-22.5 min-h-30 shrink-0">
                                        {p.poster_url ? (
                                            <Image
                                                src={p.poster_url}
                                                alt={p.title}
                                                className="block h-full min-h-30 w-22.5 object-cover"
                                                width={110}
                                                height={160}
                                                quality={90}
                                            />
                                        ) : (
                                            <div className="flex min-h-30 w-22.5 items-center justify-center border-r border-border bg-card-bg dark:bg-[#12082a]">
                                                <span
                                                    className={`font-russo text-[28px] ${picked ? "dark:text-neon-lime/40 text-neon-purple/40" : "dark:text-neon-lime/20 text-neon-purple/20"
                                                        }`}
                                                >
                                                    {p.title.slice(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 p-3">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div>
                                                <span
                                                    className={`font-barlow-condensed text-[18px] font-bold ${picked ? "dark:text-neon-lime text-neon-purple" : "text-foreground dark:text-[#e8e0ff]"
                                                        }`}
                                                >
                                                    {p.title}
                                                </span>

                                                <div className="vhs-badge mt-0.5 text-text-light">
                                                    proponowane przez {p.proposer?.username}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1.5">
                                                {leading && votedProp.length > 0 && (
                                                    <span className="vhs-badge rounded-sm uppercase dark:bg-neon-lime bg-neon-purple px-1.5 py-0.5 text-white dark:text-black">
                                                        Wygrywa
                                                    </span>
                                                )}

                                                {deleteMode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(p.id);
                                                        }}
                                                        className="vhs-badge rounded-sm cursor-pointer border border-red-500/40 bg-red-500/10 p-1 text-red-500 transition hover:bg-red-500/20"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                )}

                                                {picked && <span className="dark:text-neon-lime text-neon-purple">✓</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Bar
                                                    val={p.votes}
                                                    max={maxProp || 1}
                                                    color={(picked && lightMode) ? "#bf5fff" : (picked && !lightMode) ? "#b8ff00" : "#1a1a30"}
                                                />
                                            </div>

                                            <span
                                                className={`vhs-badge ${picked ? "dark:text-neon-lime text-neon-purple" : "text-text-light"
                                                    }`}
                                            >
                                                {p.votes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {votedProp.length > 0 && (
                <div className="mt-4 rounded-sm border dark:border-neon-lime/10 border-neon-purple/10 bg-neon-purple/5 p-3 text-center vhs-badge dark:text-neon-lime text-neon-purple">
                    ZAGŁOSOWANO NA:{" "}
                    {propositions
                        .filter((p) => votedProp.includes(p.id))
                        .map((p) => p.title)
                        .join(", ")
                        .toUpperCase()}
                </div>
            )}
        </section>
    );
};

export default MovieVoteTab;