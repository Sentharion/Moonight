"use client"
import { MovieRoom, User, SelectedMovie, DateProposal } from "../constant";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";

interface RoomPreviewProps {
    room: MovieRoom;
    host?: User | null;
    selectedMovies: SelectedMovie[];
    selectedDate: DateProposal | null;
    currentUserId: string | null;
    participants: number
    onDelete: (room_id:string) => void;
}

const RoomPreview = ({ room, host, selectedDate, selectedMovies, currentUserId, participants, onDelete }: RoomPreviewProps) => {
    const isHost = Boolean(host && currentUserId && host.id === currentUserId);
    const supabase = createClient();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if(!isHost || deleting) return;
        
        const confirmed = window.confirm(
            `Czy na pewno chcesz usunąć "${room.title}"?`
        );

        if (!confirmed) return;
        setDeleting(true);

        const {error} = await supabase.from("movie_room").delete().eq("id",room.id).eq("host_id",currentUserId);

        if(error){
            console.error("Błąd przy usuwaniu wieczoru:", error);
            alert("Wystąpił błąd przy usuwaniu wieczoru. Spróbuj ponownie.");
            setDeleting(false);
            return;
        }

        onDelete(room.id);
    }
    
    return (
    <div key={room.id} className="flex items-center gap-4 min-w-0 rounded-sm border border-border bg-card-bg dark:bg-[#0e0e1a] p-4 transition-all duration-150 hover:border-[#ff2d7840] hover:shadow-[0_0_18px_#ff2d7818]">
        <div className="min-w-0 flex-1">
            <div className="truncate text-left font-russo text-[18px] font-normal leading-[1.2] tracking-[0.04em] text-neon-pink [text-shadow:0_0_10px_#ff2d7870]">
                {room.title.toUpperCase()}
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                <span className="vhs-badge text-text-light">
                    HOST: {host?.username ?? "NIEZNANY"}
                </span>

                {room.venue && (
                    <span className="vhs-badge text-text-light">
                        📍 {room.venue}
                    </span>
                )}
            </div>

            <div className="mt-1.5 flex gap-3">
                <span className={`vhs-badge ${selectedMovies.length > 0 ? "text-neon-blue" : "text-text-light"}`}>
                    🎬 {selectedMovies.length} {selectedMovies.length === 1 ? "film" : selectedMovies.length === 2 || selectedMovies.length === 3 || selectedMovies.length === 4 ? "filmy" : "filmów"}
                </span>

                <span className={`vhs-badge ${selectedDate ? "text-neon-blue" : "text-text-light"}`}>
                    📅 {selectedDate ? `Ostateczna data: ${new Date(selectedDate.date).toLocaleDateString('pl-PL')}` : "Brak daty"}
                </span>
                <span className={`hidden sm:block vhs-badge ${participants > 0 ? "text-neon-purple dark:text-neon-lime" : "text-text-light dark:text-text-light"}`}>
                    👥 {participants} {participants === 1 ? "osoba" : participants === 2 || participants === 3 || participants === 4 ? "osoby" : "osób"}
                </span>
            </div>

            <span className={`sm:hidden mr-30 vhs-badge ${participants > 0 ? "text-neon-purple dark:text-neon-lime" : "text-text-light dark:text-text-light"}`}>
                👥 {participants} {participants === 1 ? "osoba" : participants === 2 || participants === 3 || participants === 4 ? "osoby" : "osób"}
            </span>

        </div>

        <div className="flex shrink-0 flex-col gap-2">
            <Link href={`/room/${room.invite_code}`} className="uppercase vhs-badge cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7812] px-3 py-2 font-russo text-[12px] tracking-[0.06em] text-neon-pink shadow-[0_0_12px_#ff2d7840] transition-all hover:bg-[#ff2d7820] hover:shadow-[0_0_18px_#ff2d7860]" >
            ▶ Otwórz
            </Link>

            {
                isHost && (
                    <button 
                        onClick={handleDelete} 
                        disabled={deleting} 
                        className="uppercase vhs-badge cursor-pointer rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2 font-russo text-[12px] tracking-[0.06em] text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed">
                        {deleting ? "Usuwam..." : "✕ Usuń"}
                    </button>
                )
            }
        </div>
    </div>
    )
}

export default RoomPreview;