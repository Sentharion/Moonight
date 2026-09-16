"use client"
import { useState } from "react";
import type {VoteTab} from "../../../constant"
import MovieVoteTab from "./components/MovieVoteTab";
import DateVoteTab from "./components/DateVoteTab";
import { useParams,useSearchParams } from "next/navigation";



const VotePage = () => {
    const params = useParams<{ invite_code: string }>();
    const searchParams = useSearchParams();
    const inviteCode = params.invite_code;
    const tab = searchParams.get("tab");
    const activeTab = tab === "dates" ? "dates" : "movies";
    const [voteTab, setVoteTab] = useState<VoteTab>(activeTab);

    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5">
            <div className="grid grid-cols-2 gap-1.5">
            {([
                ["movies", "🎬 FILMY"],
                ["dates", "📅 TERMINY"],
            ] as [VoteTab, string][]).map(([vt, label]) => (
            <button key={vt} onClick={() => setVoteTab(vt)} className={`py-2 rounded-sm vhs-badge transition-all cursor-pointer ${(vt === voteTab) ? (voteTab === "dates" ? "bg-neon-blue/10 border-2 border-neon-blue text-neon-blue shadow-[0_0_12px_#00e5ff40]" : "bg-neon-lime/10 border-2 border-neon-lime text-neon-lime shadow-[0_0_12px_#9eff2d40]") : "bg-[#0e0e1a] border border-border text-text-light"}`}>
                {label}
            </button>
            ))}
            </div>
            <div className="py-2">
                {voteTab === "movies" && <MovieVoteTab inviteCode={inviteCode}/>}
                {voteTab === "dates" && <DateVoteTab  inviteCode={inviteCode} />}
            </div>
        </div>
    );
};

export default VotePage;