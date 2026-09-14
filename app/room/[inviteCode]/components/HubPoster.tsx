import { MovieRoom, User, MovieRoomParticipant, MovieProposal } from "../../../constant";
import Image from "next/image";

interface HubPosterProps {
    room: MovieRoom;
    host: User;
    crew: MovieRoomParticipant[];
    leading: MovieProposal | null;
}


const HubPoster = ({ room, host, crew, leading }: HubPosterProps) => {
    return (
        <div className="relative h-50 overflow-hidden rounded-sm border-2 border-neon-pink shadow-[0_0_24px_#ff2d7830,inset_0_0_24px_#ff2d7808]">
            {leading?.posterUrl ? (
            <>
                <Image src={leading.posterUrl} alt="poster" width={400} height={600} quality={90} className="absolute inset-0 h-full w-full object-cover object-[center_20%] brightness-[0.35] saturate-[1.6]"/>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#ff2d7815,#00e5ff08)]" />
            </>
            ) : (
                ""
            )}

            <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(to_top,#080810ee_0%,#08081099_40%,transparent_60%)] p-4">
                <div className="uppercase vhs-badge mb-1 text-neon-pink">
                    ▶ Następny seans
                </div>

                <div className="font-['Russo_One'] text-[20px]! sm:text-[24px]! tracking-[0.04em] text-white">
                    {room.title?.toUpperCase()}
                </div>

                <div className="mt-2 flex flex-wrap gap-4">
                    <span className="uppercase vhs-badge text-[10px]! sm:text-[12px]! text-neon-blue">
                        📅 DATA TBD — GŁOSOWANIE
                    </span>

                    <span className="uppercase vhs-badge text-[10px]! sm:text-[12px]! text-neon-lime">
                        👥 {crew?.length} ZAPROSZONYCH
                    </span>

                    <span className="uppercase vhs-badge text-[10px]! sm:text-[12px]! text-text-light">
                        🎬 HOST: {host.username.toUpperCase()}
                    </span>

                    {room.venue && (
                        <span className="vhs-badge text-[10px]! sm:text-[12px]! text-text-light">
                            📍 {room.venue.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {leading?.posterUrl && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-sm border border-[#ff2d7840] bg-[#080810cc] px-2 py-1">
                    <span className="text-[10px] text-neon-pink">
                        ▶
                    </span>

                    <span className="uppercase vhs-badge text-[9px] text-neon-pink">
                        Prowadzi: {leading.title.toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
}       

export default HubPoster;