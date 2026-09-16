"use client";

import RoomPreview from "../components/RoomPreview";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { fetchDashboardRooms, type DashboardRoom } from "../lib/queries/dashboard";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const supabase = createClient();
    const router = useRouter();

    const [rooms, setRooms] = useState<DashboardRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadRooms = async () => {
            setLoading(true);
            setError("");
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                router.replace("/");
                return;
            }

            setCurrentUserId(user.id);

            try {
                const dashboardRooms = await fetchDashboardRooms(supabase, user.id);
                setRooms(dashboardRooms);
            } catch (err) {
                console.error("Błąd przy pobieraniu pokoi:", err);
                setError("⚠ Nie udało się załadować wieczorów");
            } finally {
                setLoading(false);
            }
        };
        loadRooms();
    }, [router, supabase]);

    const handleCreateRoom = () => {
        router.push("/create");
    };

    const handleDeleteRoom = (roomId: string) => {
        setRooms((prev) => prev.filter((room) => room.room.id !== roomId));
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="vhs-badge animate-pulse text-neon-pink">
                    ŁADOWANIE WIECZORÓW...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-start gap-8 px-6 pt-32 text-center sm:pb-0">
            {error && <div className="vhs-badge text-red-500 mb-4">{error}</div>}
            {rooms.length > 0 ? (
                <div className="flex flex-col w-full max-w-2xl sm:max-w-150 -translate-y-25">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                            Twoje wieczory
                        </span>
                        <Link
                            href="/create"
                            className="vhs-badge uppercase cursor-pointer rounded-sm border border-neon-pink/20 bg-[#ff2d7810] px-3 py-1.5 text-neon-pink transition-all hover:border-neon-pink hover:bg-[#ff2d7820]"
                        >
                            + Nowy wieczór
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {rooms.map((room) => (
                            <RoomPreview
                                key={room.room.id}
                                room={room.room}
                                host={room.host}
                                selectedDate={room.selectedDate}
                                selectedMovies={room.selectedMovies}
                                currentUserId={currentUserId}
                                onDelete={handleDeleteRoom}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <div className="font-russo select-none text-[80px] leading-none tracking-[0.02em] text-[#1a1a30]">
                            ▶
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="font-russo text-[76px] leading-none text-neon-pink opacity-[0.12] blur-sm">
                                ▶
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="font-russo text-[20px] uppercase sm:text-[26px] leading-[1.2] tracking-[0.04em] text-[#e8e0ff]">
                            Brak zaplanowanego
                            <br />
                            <span className="text-neon-pink text-[20px] uppercase sm:text-[26px] [text-shadow:0_0_16px_#ff2d78]">
                                Seansu
                            </span>
                        </div>

                        <div className="vhs-badge mt-3 text-[12px] sm:text-[16px] text-text-light">
                            Zacznij nowy seans — zaproś ekipę, wybierz film i ustal datę.
                        </div>
                    </div>

                    <button
                        onClick={handleCreateRoom}
                        className="rounded-sm border-2 cursor-pointer uppercase hover:scale-115 transition-all duration-100 border-neon-pink bg-neon-pink/[0.07] px-4 py-3.5 sm:px-8 sm:py-4 font-russo text-[16px] tracking-[0.08em] text-neon-pink shadow-[0_0_24px_#ff2d7840,inset_0_0_20px_#ff2d7808] active:scale-95"
                    >
                        ▶ Zaplanuj wieczór filmowy
                    </button>
                </>
            )}
        </div>
    );
};

export default Dashboard;
