import Image from "next/image";
import { MovieRoomParticipantWithUser } from "../../../constant";
import Link from "next/link";

interface CrewProps {
    crew: MovieRoomParticipantWithUser[];
    inviteCode: string;
    currentUserId: string | undefined;
}

const Crew = ({ crew, inviteCode,currentUserId }: CrewProps) => {

    return (
        <section>
          <div className="mb-3 mt-3 flex items-center justify-between">
            <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                Załoga
            </span>

            <Link href={`/room/${inviteCode}/invite`} className="vhs-badge cursor-pointer uppercase text-neon-pink hover:text-neon-pink/60">
                + Zaproś
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
                {crew.map((member) => {
                    const user = member.users;

                    if (!user) return null;
                    const isCurrentUser = member.user_id === currentUserId;

                    return (
                        <div
                            key={member.user_id}
                            className={`flex items-center gap-2.5 rounded-sm border border-border ${isCurrentUser ? "border-neon-pink/40" : "border-border"} bg-card-bg dark:bg-[#0e0e1a] px-3 py-2`}
                        >
                            {user.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.username}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 shrink-0 rounded-sm object-cover"
                                />
                            ) : (
                                <div className="vhs-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#ff2d7840] bg-[#1a0a2e] text-neon-pink">
                                    {user.username
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[13px] font-medium text-text-light">
                                    {user.username}
                                </div>

                                {member.role === "host" && (
                                    <div className="vhs-badge text-neon-pink">
                                        HOST
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Crew;