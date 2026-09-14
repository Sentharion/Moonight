import { DateProposalWithUser} from "../../../constant";
import Bar from "./Bar";
import Link from "next/link";

interface DatePropositionsProps {
    dates: DateProposalWithUser[];
    inviteCode:string;
    activeTab?:string;
}

const DatePropositions = ({dates,inviteCode,activeTab}: DatePropositionsProps) => {

    const maxDateProp = dates.length > 0 ? Math.max(...dates.map((d) => d.votes)) : 0;

    return (
        <section>
            <div className="mb-3 mt-3 flex items-center justify-between">
                <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                    Kiedy?
                </span>

                <Link href={`/room/${inviteCode}/vote?tab=dates`}className="vhs-badge cursor-pointer uppercase text-neon-pink hover:text-neon-pink/60">
                    {dates.length === 0 ? "PROPOZYCJA →" : "GŁOSUJ →"}
                </Link>
            </div>

            {dates.length === 0 ? (
                <div className="flex items-center justify-center gap-2 rounded-sm border border-dashed border-[#1e1e38] bg-[#0e0e1a] py-5">
                    <span className="opacity-30">
                    📅
                    </span>

                    <span className="vhs-badge uppercase text-[#333360]">
                    Nie ma jeszcze zaproponowanych dat
                    </span>
                </div>
            ) : (
                <div className="overflow-hidden rounded-sm border border-[#1e1e38] bg-[#0e0e1a]">
                    {dates.map((d, i) => {
                        const isLeading = d.votes === maxDateProp && d.votes > 0;

                        return (
                            <div key={d.id} className={`flex items-center gap-3 px-3 py-2.5 ${i < dates.length - 1 ? "border-b border-[#1a1a2e]" : ""}`}>
                                <span className={`min-w-0 flex-1 truncate font-['Share_Tech_Mono'] text-[11px] ${isLeading ? "text-neon-blue" : "text-text-light"}`}>
                                    {d.date}
                                </span>

                                <div className="w-48">
                                    <Bar val={d.votes} max={maxDateProp || 1} color={isLeading ? "#00e5ff" : "#1e1e60"} />
                                </div>

                                <span className="vhs-badge text-text-light">
                                    {d.votes}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default DatePropositions;