"use client"
import { MovieProposalWithUser, } from "../../../constant";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

interface MoviePropositionsProps {
    movies: MovieProposalWithUser[];
    inviteCode: string;
}

const MoviePropositions = ({ movies, inviteCode }: MoviePropositionsProps) => {
    const maxVotes = movies.length > 0 ? Math.max(...movies.map((p) => p.votes)) : 0;
    const [votedProps, setVotedProps] = useState<string[]>([]);


    return (
        <section>
            <div className="mb-3 mt-5 flex items-center justify-between">
                <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                    Propozycje filmów
                </span>

                <Link href={`/room/${inviteCode}/vote?tab=movies`} className="cursor-pointer vhs-badge text-neon-pink hover:text-neon-pink/60">
                    {movies.length === 0 ? "ZAPROPONUJ →" : "GŁOSUJ →"}
                </Link>
            </div>

            {movies.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border bg-card-bg dark:bg-[#0e0e1a] py-8">
                    <div className="text-[28px] opacity-30">
                        🎬
                    </div>

                    <div className="vhs-badge uppercase text-center text-text-light">
                        BRAK ZAPROPONOWANYCH FILMÓW
                        <br />
                        BĄDŹ PIERWSZY I ZAPROPONUJ FILM
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {movies.map((p) => {
                        const isLeading = p.votes === maxVotes && p.votes > 0
                        const isVoted = votedProps.includes(p.id);

                        return (
                            <div key={p.id} className={`flex items-center overflow-hidden rounded-sm ${isVoted ? "border border-[#ff2d7850] bg-pink-500/5 dark:bg-[#0a0018]" : isLeading ? "border border-[#ff2d7830] bg-card-bg dark:bg-[#0e0e1a]" : "border border-border bg-card-bg dark:bg-[#0e0e1a]"}`}>
                                {/* Poster */}
                                <div className="h-23.75 w-17.5 shrink-0">
                                    {p.poster_url ? (
                                        <Image src={p.poster_url} alt={p.title} width={110} height={150} quality={90} className="block h-23.75 w-17.5 object-cover" />
                                    ) : (
                                        <div className="flex h-23.75 w-17.5 items-center justify-center border-r border-border bg-card-bg dark:bg-[#12082a]">
                                            <span className="font-['Russo_One'] text-[22px] text-[#ff2d7840]">
                                                {p.title.slice(0, 1).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1 px-3 py-2.5">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`font-['Barlow_Condensed'] text-[15px] font-bold ${isVoted ? "text-neon-pink" : "text-foreground dark:text-[#e8e0ff]"}`}>
                                            {p.title}
                                        </span>
                                    </div>

                                    <div className="vhs-badge mt-0.5 text-text-light">
                                        propozycja: {p.proposer?.username}
                                    </div>
                                </div>

                                {/* Votes */}
                                <div className="flex items-center gap-2 pr-3">
                                    {isLeading && (
                                        <span className="vhs-badge uppercase rounded-sm bg-neon-pink px-1.5 py-0.5 text-[#000]">
                                            Wygrywa!
                                        </span>
                                    )}

                                    <span className="vhs-badge text-text-light">
                                        {p.votes}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default MoviePropositions;