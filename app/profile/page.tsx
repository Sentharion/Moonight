"use client"
import { useState } from "react";
import { Pencil } from "lucide-react";
const ProfilePage = () => {
    const [draft, setDraft] = useState("");
    const onSave = (name: string) => {
        if (name.length > 16) return alert("Name must be less than 16 characters");

    }
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 overflow-y-auto px-4 py-8 pb-24">

            <div>
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-white">
                    Twój{" "}
                    <span className="text-neon-pink [text-shadow:0_0_12px_#ff2d78]">
                        profil
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    Ustaw swoje imię i avatar przed dołączeniem do seansu.
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-sm border-2 border-neon-pink/19 bg-[#0e0e1a] p-6">

                <div className="group relative flex h-20 w-20 items-center justify-center rounded-sm border-2 border-neon-pink bg-[linear-gradient(135deg,#1a0a2e,#2a0a1e)] shadow-[0_0_20px_#ff2d7840]">
                    <span className="font-russo text-[28px] text-neon-pink">
                        {(draft || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <button className="absolute -bottom-3 -right-3 cursor-pointer border-2 border-neon-pink p-1 bg-[#0e0e1a] rounded-full text-neon-pink transition-transform group-hover:scale-110 text-[20px]">
                        <Pencil size={15} />
                    </button>
                </div>


                <div className="vhs-badge text-text-light">
                    BRAK AKTYWNEGO SEANSU
                </div>

            </div>

            <div>
                <div className="vhs-badge mb-2 uppercase text-neon-blue">
                    Twoje imię
                </div>

                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="np. Kenji M."
                    onFocus={(e) => {
                        e.currentTarget.classList.add("border-neon-pink/50");
                    }}
                    onBlur={(e) => {
                        e.currentTarget.classList.remove("border-neon-pink/50");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && draft.trim()) {
                            onSave(draft.trim());
                        }
                    }}
                    className="w-full rounded-sm border border-[#1e1e38] bg-[#0e0e1a] px-3 py-3 font-barlow text-[14px] text-[#e8e0ff] caret-neon-pink outline-none transition-colors placeholder:text-[#333360] focus:border-neon-pink/50" />
            </div>

            <button
                onClick={() => draft.trim() && onSave(draft.trim())}
                disabled={!draft.trim()}
                className={`w-full rounded-sm py-3.5 font-russo text-[14px] uppercase tracking-[0.08em] transition-all ${draft.trim() ? "cursor-pointer border-2 border-neon-pink bg-neon-pink/[0.09] text-neon-pink shadow-[0_0_16px_#ff2d7840] hover:bg-neon-pink/[0.14]" : "cursor-not-allowed border border-[#1e1e38] bg-[#0e0e1a] text-[#333360]"}`}
            >
                Zapisz profil
            </button>
        </div>
    );
}
export default ProfilePage    