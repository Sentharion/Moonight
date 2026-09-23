"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "../../lib/supabase/client";
import { fetchFullRoomBundle } from "../../lib/queries/room";
import type { MovieProposalWithUser, DateProposalWithUser } from "../../constant";

import { ensureUserProfile } from "../../lib/queries/user";

interface RoomDataContextType {
    loading: boolean;
    error: string;
    inviteCode: string;
    roomId: string | null;
    hostId: string | null;
    currentUserId: string | null;
    isHost: boolean;
    dateVotingActive: boolean;
    movieProposals: MovieProposalWithUser[];
    votedMovies: string[];
    dateProposals: DateProposalWithUser[];
    votedDates: string[];
    selectedDate: DateProposalWithUser | null;
    addMovieProposalState: (newMovie: MovieProposalWithUser) => void;
    setDateVotingActiveState: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedDateState: React.Dispatch<React.SetStateAction<DateProposalWithUser | null>>;
    removeMovieProposalState: (id: string) => void;
    setVotedMoviesState: React.Dispatch<React.SetStateAction<string[]>>;
    setMovieProposalsState: React.Dispatch<React.SetStateAction<MovieProposalWithUser[]>>;
    addDateProposalState: (newDate: DateProposalWithUser) => void;
    removeDateProposalState: (id: string) => void;
    setVotedDatesState: React.Dispatch<React.SetStateAction<string[]>>;
    setDateProposalsState: React.Dispatch<React.SetStateAction<DateProposalWithUser[]>>;
    reload: () => Promise<void>;
}

const RoomDataContext = createContext<RoomDataContextType | undefined>(undefined);

export function RoomDataProvider({
    children,
    inviteCode,
}: {
    children: ReactNode;
    inviteCode: string;
}) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [hostId, setHostId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [movieProposals, setMovieProposals] = useState<MovieProposalWithUser[]>([]);
    const [dateVotingActive, setDateVotingActive] = useState(true);
    const [selectedDate, setSelectedDate] = useState<DateProposalWithUser | null>(null);
    const [votedMovies, setVotedMovies] = useState<string[]>([]);
    const [dateProposals, setDateProposals] = useState<DateProposalWithUser[]>([]);
    const [votedDates, setVotedDates] = useState<string[]>([]);

    const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user) {
                setError("⚠ Nie udało się pobrać użytkownika.");
                setLoading(false);
                return;
            }

            const userId = authData.user.id;
            setCurrentUserId(userId);
            await ensureUserProfile(supabase, authData.user);

            const bundle = await fetchFullRoomBundle(supabase, inviteCode, userId);

            if (!bundle) {
                setError("⚠ Nie udało się pobrać pokoju.");
                setLoading(false);
                return;
            }

            const selectedDate = bundle.room.selected_date_id ? bundle.dateProposals.find((date) => date.id === bundle.room.selected_date_id) ?? null: null;

            setRoomId(bundle.room.id);
            setHostId(bundle.room.host_id);
            setSelectedDate(selectedDate);

            setMovieProposals(bundle.movieProposals);
            setDateProposals(bundle.dateProposals);
            setDateVotingActive(bundle.room.date_voting_active);

            setVotedMovies(bundle.movieVotedIds);
            setVotedDates(bundle.dateVotedIds);
        } catch (err) {
            console.error("RoomDataProvider error loading data:", err);
            setError("⚠ Wystąpił błąd podczas ładowania danych.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [inviteCode]);

    const addMovieProposalState = (newMovie: MovieProposalWithUser) => {
        setMovieProposals((prev) => [...prev, newMovie]);
    };

    const removeMovieProposalState = (id: string) => {
        setMovieProposals((prev) => prev.filter((m) => m.id !== id));
        setVotedMovies((prev) => prev.filter((vId) => vId !== id));
    };

    const addDateProposalState = (newDate: DateProposalWithUser) => {
        setDateProposals((prev) => [...prev, newDate]);
    };

    const removeDateProposalState = (id: string) => {
        setDateProposals((prev) => prev.filter((d) => d.id !== id));
        setVotedDates((prev) => prev.filter((vId) => vId !== id));
    };

    return (
        <RoomDataContext.Provider
            value={{
                loading,
                error,
                inviteCode,
                roomId,
                hostId,
                currentUserId,
                isHost,
                movieProposals,
                votedMovies,
                dateProposals,
                votedDates,
                dateVotingActive,
                selectedDate,
                addMovieProposalState,
                removeMovieProposalState,
                setDateVotingActiveState: setDateVotingActive,
                setSelectedDateState: setSelectedDate,
                setVotedMoviesState: setVotedMovies,
                setMovieProposalsState: setMovieProposals,
                addDateProposalState,
                removeDateProposalState,
                setVotedDatesState: setVotedDates,
                setDateProposalsState: setDateProposals,
                reload: loadData,
            }}
        >
            {children}
        </RoomDataContext.Provider>
    );
}

export function useRoomData() {
    const context = useContext(RoomDataContext);
    if (!context) {
        throw new Error("useRoomData must be used within a RoomDataProvider");
    }
    return context;
}
