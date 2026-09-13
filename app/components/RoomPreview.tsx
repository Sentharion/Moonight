import { MovieRoom, User, SelectedMovie, DateProposal } from "../constant";
import Link from "next/link";

interface RoomPreviewProps {
    room: MovieRoom;
    host: User;
    selectedMovies: SelectedMovie[];
    selectedDate: DateProposal | null;
}

const RoomPreview = ({ room, host, selectedDate, selectedMovies }: RoomPreviewProps) => {
    return (
    <div key={room.id} className="flex items-center gap-4 min-w-0 rounded-sm border border-[#1e1e38] bg-[#0e0e1a] p-4 transition-all duration-150 hover:border-[#ff2d7840] hover:shadow-[0_0_18px_#ff2d7818]">
        <div className="min-w-0 flex-1">
            <div className="truncate text-left font-russo text-[18px] font-normal leading-[1.2] tracking-[0.04em] text-neon-pink [text-shadow:0_0_10px_#ff2d7870]">
                {room.title.toUpperCase()}
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                <span className="vhs-badge text-text-light">
                    HOST: {host.username}
                </span>

                {room.venue && (
                    <span className="vhs-badge text-text-light">
                        📍 {room.venue}
                    </span>
                )}
            </div>

            <div className="mt-1.5 flex gap-3">
                <span className={`vhs-badge ${selectedMovies.length > 0 ? "text-neon-blue" : "text-[#333360]"}`}>
                    🎬 {selectedMovies.length} filmy
                </span>

                <span className={`vhs-badge ${selectedDate ? "text-neon-blue" : "text-[#333360]"}`}>
                    📅 {selectedDate ? `Ostateczna data: ${new Date(selectedDate.date).toLocaleDateString('pl-PL')}` : "Brak daty"}
                </span>
            </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
            <Link href={`/room/${room.inviteCode}`} className="uppercase vhs-badge cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7812] px-3 py-2 font-russo text-[12px] tracking-[0.06em] text-neon-pink shadow-[0_0_12px_#ff2d7840] transition-all hover:bg-[#ff2d7820] hover:shadow-[0_0_18px_#ff2d7860]" >
            ▶ Otwórz
            </Link>

            <button className="uppercase vhs-badge cursor-pointer rounded-sm border border-neon-pink/20 bg-transparent text-[11px] px-3 py-2 text-text-light transition-all hover:border-neon-pink/35 hover:text-neon-pink" >
            ✕ Usuń
            </button>
        </div>
    </div>
    )
}

export default RoomPreview;