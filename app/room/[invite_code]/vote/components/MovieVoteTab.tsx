"use client"
import Bar from "../../components/Bar";
import { MovieProposalWithUser, ReelDBMovie, User, MovieVote } from "../../../../constant";
import { useEffect, useState } from "react";
import Image from "next/image";
import MoviePicker from "./MoviePicker";
import { X } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";


interface MovieVoteTabProps {
    inviteCode: string;
}

const MovieVoteTab = ({ inviteCode }: MovieVoteTabProps) => {
    const supabase = createClient();
    const [showPropForm, setShowPropForm] = useState(false);
    const [propBy, setPropBy] = useState("");
    const [selectedMovie, setSelectedMovie] = useState<ReelDBMovie | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [hostId, setHostId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [propositions, setPropositions] = useState<MovieProposalWithUser[]>([]);
    const [votedProp, setVotedProp] = useState<string[]>([]);
    const [error, setError] = useState("");
    const isHost = currentUserId !== null && hostId !== null && currentUserId === hostId;

    useEffect(() => {
        const loadMovies = async () => {
            setLoading(true);
            setError("");

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                setError("⚠ Nie udało się pobrać użytkownika.");
                setLoading(false);
                return;
            }

            setCurrentUserId(user.id);

            const { data: room, error: roomError } = await supabase.from("movie_room").select("id,host_id").eq("invite_code", inviteCode).single();
            if (roomError || !room) {
                console.error("Błąd przy pobieraniu pokoju:", roomError);
                setError("⚠ Nie udało się pobrać pokoju.");
                setLoading(false);
                return;
            }

            setHostId(room.host_id);

            const { data: movieProposals, error: movieProposalsError } = await supabase.from("movie_proposals").select(`
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
                `).eq("room_id", room.id).order("created_at", { ascending: true });

            if (movieProposalsError) {
                console.error("Błąd przy pobieraniu propozycji filmów:", movieProposalsError);
                setError("⚠ Nie udało się pobrać propozycji filmów.");
                setLoading(false);
                return;
            }

            const movieProposalIds = (movieProposals ?? []).map(movie => movie.id)

            let votes: Pick<MovieVote, "movie_proposal_id" | "user_id">[] = [];

            if (movieProposalIds.length > 0) {
                const { data: moviesVoteData, error: moviesVoteError } = await supabase.from("movie_vote").select("movie_proposal_id, user_id").in("movie_proposal_id", movieProposalIds);

                if (moviesVoteError) {
                    console.error("MOVIE VOTES ERROR:", moviesVoteError);
                    setLoading(false);
                    return;
                } else {
                    votes = moviesVoteData ?? [];
                }
            }

            const myVotes = votes.filter((vote) => vote.user_id === user.id).map((vote) => vote.movie_proposal_id);

            const formattedMovies: MovieProposalWithUser[] =
                (movieProposals ?? []).map(
                    (movie) => {
                        const proposer =
                            Array.isArray(movie.users)
                                ? movie.users[0]
                                : movie.users;

                        return {
                            id: movie.id,
                            room_id: movie.room_id,
                            proposed_by: movie.proposed_by,
                            movie_id: movie.movie_id,
                            title: movie.title,
                            year: movie.year,
                            poster_url:
                                movie.poster_url,
                            created_at:
                                movie.created_at,

                            proposer:
                                proposer as User,

                            votes: votes.filter(
                                (vote) =>
                                    vote.movie_proposal_id ===
                                    movie.id
                            ).length,
                        };
                    }
                );

            setVotedProp(myVotes);
            setPropositions(formattedMovies);
            setLoading(false);
        };

        loadMovies();
    }, [inviteCode]);

    const addProposition = async () => {
        if (!selectedMovie || !currentUserId) {
            return;
        }
        setActionLoading(true);
        setError("");

        const {
            data: room,
            error: roomError,
        } = await supabase
            .from("movie_room")
            .select("id")
            .eq("invite_code", inviteCode)
            .single();

        if (roomError) {
            console.error("Błąd przy pobieraniu pokoju:", roomError);
            setError("⚠ Nie znaleziono pokoju");
            setActionLoading(false);
            return;
        }

        const {
            data: newMovie,
            error: insertError,
        } = await supabase
            .from("movie_proposals")
            .insert({
                room_id: room.id,
                proposed_by: currentUserId,
                movie_id: selectedMovie.imdbID,
                title: selectedMovie.Title,
                year: selectedMovie.Year,
                poster_url:
                    selectedMovie.Poster !== "N/A"
                        ? selectedMovie.Poster
                        : null,
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
            setError("⚠ Nie udało się dodać propozycji filmu.");
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

        setPropositions((prev) => [
            ...prev,
            newProposition,
        ]);

        setSelectedMovie(null);
        setShowPropForm(false);
        setActionLoading(false);
    }

    const handleVote = async (id: string) => {
        if (deleteMode || !currentUserId || actionLoading) return;

        setActionLoading(true);
        setError("");

        const alreadyVoted = votedProp.includes(id);

        if (alreadyVoted) {
            const { error: deleteError } = await supabase.from("movie_vote").delete().eq("movie_proposal_id", id).eq("user_id", currentUserId);

            if (deleteError) {
                console.error("Błąd przy usuwaniu głosu:", deleteError);
                setError("⚠ Nie udało się usunąć głosu.");
                setActionLoading(false);
                return;
            }

            setVotedProp((prev) => prev.filter((voteId) => voteId !== id));

            setPropositions((prev) => prev.map((movie) => movie.id === id ? { ...movie, votes: Math.max(0, movie.votes - 1), } : movie));

        } else {
            const { error: insertError } = await supabase.from("movie_vote").insert({ movie_proposal_id: id, user_id: currentUserId, });

            if (insertError) {
                console.error("Błąd przy dodawaniu głosu:", insertError);
                setError("⚠ Nie udało się dodać głosu.");
                setActionLoading(false);
                return;
            }

            setVotedProp((prev) => [...prev, id]);

            setPropositions((prev) => prev.map((movie) => movie.id === id ? { ...movie, votes: movie.votes + 1 } : movie));
        }

        setActionLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!isHost || actionLoading) {
            return;
        }

        setActionLoading(true);
        setError("");

        const { error: deleteError } = await supabase.from("movie_proposals").delete().eq("id", id);

        if (deleteError) {
            console.error("Błąd przy usuwaniu propozycji filmu:", deleteError);
            setError("⚠ Nie udało się usunąć propozycji filmu.");
            setActionLoading(false);
            return;
        }

        setPropositions((prev) => prev.filter((movie) => movie.id !== id));
        setVotedProp((prev) => prev.filter((voteId) => voteId !== id));

        setActionLoading(false);
    }

    const toggleDeleteMode = () => {
        if (!isHost) return;

        setDeleteMode((prev) => !prev);
        setShowPropForm(false);
    };

    const maxProp = propositions.length > 0 ? Math.max(...propositions.map((p) => p.votes)) : 0;

    return (
        <section>
            <div className="mb-4">
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-white">
                    Co{" "}
                    <span className="text-neon-lime drop-shadow-[0_0_12px_#9eff2d]">
                        oglądamy?
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    {propositions.length === 0
                        ? "Nie wybrano żadnych filmów - dodaj jeden poniżej"
                        : "Zagłosuj na film który objerzmy"}
                </div>
            </div>

            {/* Propose form */}
            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className={`uppercase vhs-badge ${deleteMode ? "text-red-500" : "text-neon-lime"}`}>
                        Propozycje filmów {deleteMode ? "(tryb usuwania)" : ""}
                    </span>

                    <div className="flex gap-2">
                        <button onClick={() => setShowPropForm(!showPropForm)} className={`vhs-badge cursor-pointer rounded-sm border px-2.5 py-1 transition-all ${showPropForm ? "border-neon-lime/35 bg-neon-lime/10 text-neon-lime hover:bg-neon-lime/15" : "border-neon-lime/35 bg-transparent text-neon-lime hover:bg-neon-lime/10"}`}>
                            {showPropForm ? "✕ ANULUJ" : "+ DODAJ"}
                        </button>
                        {
                            (!showPropForm && isHost) &&
                            <button onClick={toggleDeleteMode} className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500 ${deleteMode ? "border-red-500/35 bg-red-500/10" : "border-red-500/35 bg-transparent"}`}>
                                ✕ Usuń
                            </button>
                        }
                    </div>
                </div>

                {showPropForm && (
                    <div className="flex flex-col gap-2 rounded-sm border border-neon-lime/20 bg-[#0e0e1a] p-3">
                        <MoviePicker onSelectMovie={(movie) => setSelectedMovie(movie)} />
                        {selectedMovie && (
                            <button
                                type="button"
                                onClick={addProposition}
                                className="vhs-badge rounded-sm border border-neon-lime/40 bg-neon-lime/10 px-3 py-2 text-neon-lime transition hover:bg-neon-lime/20"
                            >
                                + DODAJ FILM DO PROPOZYCJI
                            </button>
                        )}
                    </div>
                )}
            </div>

            {propositions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border bg-[#0e0e1a] py-10">
                    <div className="text-[32px] opacity-30">
                        🎬
                    </div>

                    <div className="vhs-badge text-center uppercase text-[#333360]">
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
                                className={`w-full overflow-hidden rounded-sm text-left transition-all duration-200 ${picked ? "border-2 border-neon-lime bg-neon-lime/10 shadow-[0_0_18px_#9eff2d40]" : leading && votedProp.length > 0 ? "border border-neon-lime/25 bg-transparent" : "border border-transparent bg-transparent"} ${deleteMode ? "cursor-default" : "cursor-pointer"}`}
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
                                            <div className="flex min-h-30 w-22.5 items-center justify-center border-r border-border bg-[#12082a]">
                                                <span className={`font-russo text-[28px] ${picked ? "text-neon-lime/40" : "text-neon-lime/20"}`}>
                                                    {p.title.slice(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 p-3">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div>
                                                <span className={`font-barlow-condensed text-[18px] font-bold ${picked ? "text-neon-lime" : "text-[#e8e0ff]"}`}>
                                                    {p.title}
                                                </span>

                                                <div className="vhs-badge mt-0.5 text-text-light">
                                                    proponowane przez {p.proposer?.username}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1.5">
                                                {leading && votedProp.length > 0 && (
                                                    <span className="vhs-badge rounded-sm uppercase bg-neon-lime px-1.5 py-0.5 text-[#000]">
                                                        Wygrywa
                                                    </span>
                                                )}

                                                {deleteMode && (
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="vhs-badge rounded-sm cursor-pointer border border-red-500/40 bg-red-500/10 p-1 text-red-500 transition hover:bg-red-500/20"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                )}

                                                {picked && (
                                                    <span className="text-neon-lime">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Bar
                                                    val={p.votes}
                                                    max={maxProp || 1}
                                                    color={picked ? "#b8ff00" : "#2a2a50"}
                                                />
                                            </div>

                                            <span className={`vhs-badge ${picked ? "text-neon-lime" : "text-text-light"}`}>
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
                <div className="mt-4 rounded-sm border border-neon-lime/10 bg-neon-lime/5 p-3 text-center vhs-badge text-neon-lime">
                    ZAGŁOSOWANO NA: {" "}
                    {propositions
                        .filter((p) => votedProp.includes(p.id))
                        .map((p) => p.title)
                        .join(", ")
                        .toUpperCase()}
                </div>
            )}
        </section>
    );
}

export default MovieVoteTab