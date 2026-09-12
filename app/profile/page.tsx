"use client"
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
const ProfilePage = () => {
    const router = useRouter();
    const [draft, setDraft] = useState("");
    const [profileName, setProfileName] = useState("");
    const [profileEditing, setProfileEditing] = useState(false);
    const [eventName, setEventName] = useState("");
    const [eventHost, setEventHost] = useState("");
    const [profileDraft, setProfileDraft] = useState("");

    const onSave = (name: string) => {
        if (name.length > 16) return alert("Name must be less than 16 characters");

    }
    return (
        <div className="x-auto container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-8 py-8 pb-22 sm:pb-8">
            <div>
                <div className="font-['Russo_One'] text-[20px] tracking-[0.04em] uppercase text-white">
                    Twój{" "}
                    <span className="text-neon-pink [text-shadow:0_0_12px_#ff2d78]">
                        profil
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    Twoja tożsamość — edytuj imię oraz avatara.
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-sm border-2 border-neon-pink/10 bg-[#0e0e1a] p-6 shadow-[0_0_24px_#ff2d7810]">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-sm border-2 border-neon-pink bg-gradient-to-br from-[#1a0a2e] to-[#2a0a1e] shadow-[0_0_20px_#ff2d7840]">
                    <span className="font-['Russo_One'] text-[28px] text-neon-pink">
                        {(profileName || eventHost || "?").slice(0, 2).toUpperCase()}
                    </span>
                    {profileEditing && (
                        <button className="absolute -bottom-2 -right-3 z-10 cursor-pointer border rounded-full border-neon-pink bg-gradient-to-br from-[#1a0a2e] to-[#2a0a1e] p-1.5 text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-colors hover:bg-[#ff2d78] hover:text-white" aria-label="Edit name">
                            <Pencil size={16} />
                        </button>
                    )}
                </div>


                {profileEditing ? (
                    <div className="flex w-full max-w-xs gap-2">
                        <input
                            value={profileDraft}
                            onChange={(e) => setProfileDraft(e.target.value)}
                            placeholder="Twoje imię"
                            autoFocus
                            className="flex-1 rounded-sm border border-neon-pink/30 bg-[#080810] px-3 py-2 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setProfileName(profileDraft.trim() || profileName);
                                    setProfileEditing(false);
                                }

                                if (e.key === "Escape") {
                                    setProfileEditing(false);
                                }
                            }}
                        />

                        <button
                            onClick={() => {
                                setProfileName(profileDraft.trim() || profileName);
                                setProfileEditing(false);
                            }}
                            className="vhs-badge cursor-pointer rounded-sm border-2 hover:scale-[1.02] transition-all border-neon-pink bg-neon-pink/10 uppercase px-3 py-1 text-neon-pink"
                        >
                            Zapisz
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="font-['Russo_One'] text-[18px] tracking-[0.04em] text-[#e8e0ff]">
                            {profileName || eventHost || "Anonymous"}
                        </div>

                        <button
                            onClick={() => {
                                setProfileDraft(profileName || eventHost);
                                setProfileEditing(true);
                            }}
                            className="vhs-badge cursor-pointer rounded-sm border border-[#1e1e38] hover:border-[#ff2d7840] hover:text-neon-pink uppercase px-2 py-1 text-text-light"
                        >
                            Edytuj
                        </button>
                    </div>
                )}

                <div className="vhs-badge text-text-light">
                    {eventHost === (profileName || eventHost) ? "HOST" : "CREW MEMBER"} ·{" "}
                    {eventName.toUpperCase()}
                </div>
            </div>
            <button onClick={() => { router.push('/')}} className="w-full cursor-pointer rounded-sm border border-[#ff2d7840] bg-transparent py-3.5 font-russo_one text-[13px] tracking-[0.08em] text-text-light transition-all duration-200 hover:border-neon-pink hover:text-neon-pink uppercase">⏏ Wyloguj się</button>
        </div>
    );
}
export default ProfilePage    