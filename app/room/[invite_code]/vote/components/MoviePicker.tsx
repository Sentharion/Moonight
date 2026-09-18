"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface ReelDBMovie {
    Title: string;
    Year: string;
    imdbID: string;
    Type: "movie";
    Poster: string;
}

interface ReelDBSearchResponse {
    Search?: ReelDBMovie[];
    totalResults?: string;
    Response: "True" | "False";
}

interface MoviePickerProps {
    onSelectMovie: (movie: ReelDBMovie | null) => void;
}

const MoviePicker = ({ onSelectMovie }: MoviePickerProps) => {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<ReelDBMovie[]>([]);
    const [selectedMovie, setSelectedMovie] =
        useState<ReelDBMovie | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setMovies([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `/api/movies/?q=${encodeURIComponent(query.trim())}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Nie udało się wyszukać filmów"
                    );
                }

                const data: ReelDBSearchResponse =
                    await response.json();

                setMovies(data.Search ?? []);
            } catch (error) {
                console.error("Movie search error:", error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleSelectMovie = (movie: ReelDBMovie) => {
        setSelectedMovie(movie);
        setMovies([]);
        onSelectMovie(movie);
    };

    const handleChangeMovie = () => {
        setSelectedMovie(null);
        setQuery("");
        setMovies([]);
        onSelectMovie(null);
    };

    return (
        <div className="flex flex-col gap-3">
            {!selectedMovie ? (
                <div className="relative">
                    <label className="flex flex-col gap-2">
                        <span className="font-['Russo_One'] text-[14px] font-bold uppercase tracking-[0.15em] text-foreground">
                            Znajdź film
                        </span>

                        <input
                            type="search"
                            value={query}
                            onChange={(e) =>
                                setQuery(e.target.value)
                            }
                            placeholder="Wpisz tytuł filmu..."
                            className="rounded-sm border border-neon-lime/30 bg-input-bg dark:bg-[#0e0e1a] p-2 text-foreground dark:text-[#e8e0ff] font-normal outline-none focus:border-neon-lime/70"
                        />
                    </label>

                    {loading && (
                        <div className="absolute z-50 mt-2 w-full rounded-sm border border-neon-lime/20 bg-card-bg dark:bg-[#0e0e1a] p-3 text-sm text-text-light">
                            Szukanie...
                        </div>
                    )}

                    {!loading && movies.length > 0 && (
                        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-sm border border-neon-lime/20 bg-card-bg dark:bg-[#0e0e1a]">
                            {movies.map((movie) => (
                                <button
                                    key={movie.imdbID}
                                    type="button"
                                    onClick={() =>
                                        handleSelectMovie(movie)
                                    }
                                    className="flex w-full items-center gap-3 border-b border-border p-2 text-left transition-colors hover:bg-neon-lime/10"
                                >
                                    {movie.Poster &&
                                    movie.Poster !== "N/A" ? (
                                        <Image
                                            src={movie.Poster}
                                            alt={movie.Title}
                                            width={240}
                                            height={360}
                                            quality={90}
                                            className="h-16 w-11 shrink-0 rounded-sm object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 uppercase w-11 shrink-0 items-center justify-center rounded-sm bg-border text-[9px] text-text-light">
                                            brak plakatu
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <p className="truncate font-['Russo_One'] text-sm text-foreground dark:text-white">
                                            {movie.Title}
                                        </p>

                                        <p className="mt-1 text-xs text-text-light">
                                            {movie.Year}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading &&
                        query.trim().length >= 2 &&
                        movies.length === 0 && (
                            <div className="absolute z-50 mt-2 w-full rounded-sm border border-neon-lime/20 bg-card-bg dark:bg-[#0e0e1a] p-3 text-sm text-text-light">
                                Nie znaleziono filmu.
                            </div>
                        )}
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-sm border border-neon-lime/20 bg-card-bg dark:bg-[#0e0e1a] p-2">
                    {selectedMovie.Poster &&
                    selectedMovie.Poster !== "N/A" ? (
                        <Image
                            src={selectedMovie.Poster}
                            alt={selectedMovie.Title}
                            width={240}
                            height={360}
                            quality={90}
                            className="h-36 w-24 shrink-0 rounded-sm object-cover"
                        />
                    ) : (
                        <div className="h-36 w-24 shrink-0 rounded-sm bg-white/5" />
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-russo text-sm text-neon-lime">
                            {selectedMovie.Title}
                        </span>

                        <span className="vhs-badge mt-1 text-text-light">
                            {selectedMovie.Year}
                        </span>

                        <button
                            type="button"
                            onClick={handleChangeMovie}
                            className="vhs-badge mt-3 w-fit cursor-pointer rounded-sm border border-neon-lime/20 px-2 py-1 text-neon-lime transition-colors hover:bg-neon-lime/10"
                        >
                            ← ZMIEŃ FILM
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoviePicker;