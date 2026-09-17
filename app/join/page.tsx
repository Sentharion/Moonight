"use client"
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";
import { ensureUserProfile } from "../lib/queries/user";

const JoinPage = () => {
    const [code,setCode] = useState("");
    const[loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    const supabase = createClient();
    const router = useRouter();

    const handleJoin = async () => {
        const inviteCode = code.trim();
        if (!inviteCode || loading) return;

        setLoading(true);
        setError("");
        

        try{
            const { data: { user }, error:authError } = await supabase.auth.getUser();

            if (authError || !user) {
                setError("⚠ Błąd autoryzacji. Zaloguj się.");
                setLoading(false);
                return;
            }

            await ensureUserProfile(supabase, user);


            const {data: room, error} = await supabase.from("movie_room").select("id").eq("invite_code", inviteCode).maybeSingle();

            if (error || !room) {
                console.error("Błąd przy pobieraniu pokoju:",error);
                setError("⚠ Nie udało się pobrać pokoju.");
                setLoading(false);
                return;
            }

            const {data: existingParticipant,error: participantError} = await supabase.from("movie_room_participants").select("room_id").eq("room_id", room.id).eq("user_id", user.id).maybeSingle();

            if (participantError) {
                console.error("Błąd przy sprawdzaniu uczestnika:",participantError);

                setError("⚠ Nie udało się sprawdzić uczestnictwa.");
                setLoading(false);
                return;
            }

            if(!existingParticipant){
                const { error: insertError } = await supabase
                    .from("movie_room_participants")
                    .insert({
                        room_id: room.id,
                        user_id: user.id,
                        role: "participant",
                    });

                if(insertError){
                    console.error("Błąd przy dodawaniu uczestnika do wieczoru:",insertError);
                    setError("⚠ Nie udało się dołączyć do wieczoru.");
                    setLoading(false);
                    return;
                }
            }

            router.push(`/room/${inviteCode}`);

        }
        catch(error){
            console.error("Nieoczekiwany błąd:", error);
            setError("⚠ Nieoczekiwany błąd. Spróbuj ponownie.");
        }finally{
            setLoading(false);
        }
    };

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

            {error && <div className="mt-2 text-neon-pink vhs-badge text-[14px]">{error}</div>}

            <div className="flex flex-col gap-4 rounded-sm border-2 border-neon-pink/19 bg-[#0e0e1a] p-5 shadow-[0_0_24px_#ff2d7810]">

                <div className="vhs-badge text-neon-pink uppercase">
                    ▶ Kod zaproszeniowy
                </div>

                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="np. 123456" className="w-full rounded-sm border border-border bg-[#080810] px-3 py-3 font-mono text-[13px] text-[#e8e0ff] caret-neon-pink outline-none transition-colors placeholder:text-[#333360] focus:border-neon-pink/50"/>
                <button disabled={!code.trim() || loading} onClick={handleJoin} className={`w-full rounded-sm py-3.5 font-russo text-[14px] tracking-[0.08em] transition-all ${code.trim() ? "cursor-pointer border-2 border-neon-pink bg-neon-pink/9 text-neon-pink shadow-[0_0_16px_#ff2d7840] hover:bg-neon-pink/14 uppercase" : "cursor-not-allowed border border-border bg-[#0e0e1a] text-text-light uppercase"}`}>
                    {loading ? "Dołączanie..." : "▶ Dołącz"}
                </button>
            </div>
        </div>
    );
}
export default JoinPage