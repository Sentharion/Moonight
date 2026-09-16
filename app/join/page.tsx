"use client"
import { useState } from "react";
const JoinPage = () => {
    const [code,setCode] = useState("");
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-8 py-8 pb-22 sm:pb-8">

            <div>
                <div className="font-russo text-[18px] sm:text-[20px] uppercase tracking-[0.04em] text-white">
                    DOŁĄCZ DO{" "}
                    <span className="text-neon-pink [text-shadow:0_0_12px_#ff2d78]">
                        SEANSU
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light text-[10px]! sm:text-[12px]!">
                    Wprowadź kod aby dołączyć do czyjegoś wieczoru filmowego.
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-sm border-2 border-neon-pink/19 bg-[#0e0e1a] p-5 shadow-[0_0_24px_#ff2d7810]">

                <div className="vhs-badge text-neon-pink uppercase">
                    ▶ Kod zaproszeniowy
                </div>

                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="np. 123456" className="w-full rounded-sm border border-border bg-[#080810] px-3 py-3 font-mono text-[13px] text-[#e8e0ff] caret-neon-pink outline-none transition-colors placeholder:text-[#333360] focus:border-neon-pink/50"/>
                <button disabled={!code.trim()} className={`w-full rounded-sm py-3.5 font-russo text-[14px] tracking-[0.08em] transition-all ${code.trim() ? "cursor-pointer border-2 border-neon-pink bg-neon-pink/9 text-neon-pink shadow-[0_0_16px_#ff2d7840] hover:bg-neon-pink/14 uppercase" : "cursor-not-allowed border border-border bg-[#0e0e1a] text-text-light uppercase"}`}>▶ Dołącz</button>
            </div>
        </div>
    );
}
export default JoinPage