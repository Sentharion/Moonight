"use client";
import { useState} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

const CreatePage = () => {
    const generateInviteCode = () => {
        return Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    };

    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [venue, setVenue] = useState(""); 
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState("");

    const canLaunch = name.trim().length >= 3 && venue.trim().length >= 3 && !loading;

    const handleCreateNight = async () =>{
        if(!canLaunch) return;

        setLoading(true);
        setError("");

        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if(authError || !user) {
            console.error("AUTH ERROR:", authError);
            setError("⚠ Wystąpił błąd autoryzacji. Zaloguj się ponownie.");
            setLoading(false);
            return;
        }

        const inviteCode = generateInviteCode();

        const {data:room,error:roomError} = await supabase.from("movie_room").insert({
            title: name,
            venue: venue,
            host_id: user.id,
            invite_code: inviteCode,
        }).select().single();

        if(roomError || !room){
            console.error("CREATE ROOM ERROR:", roomError);
            setError("⚠ Nie udało się utworzyć wieczoru filmowego. Spróbuj ponownie.");
            setLoading(false);
            return;
        }

        const {error: hostError} = await supabase.from("movie_room_participants").insert({
            room_id: room.id,
            user_id: user.id,
            role: "host",
        });

        if(hostError){
            console.error("CREATE HOST ERROR:", hostError);
            setError("⚠ Nie udało się ustawić gospodarza. Spróbuj ponownie.");
            await supabase.from("movie_room").delete().eq("id",room.id);
            setLoading(false);
            return;
        }

        router.replace(`/room/${room.invite_code}/`);
        router.refresh();
    }



    return (
        <div className="flex min-h-full p-2 flex-col bg-[#080810]">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-4 sm:px-7 py-6 pb-6">
                <div>
                    <div className="font-['Russo_One'] uppercase text-[20px] tracking-[0.04em] text-white">
                        Utwórz nowy
                        <span className="text-neon-pink ml-2 [text-shadow:0_0_12px_#ff2d78]">
                             wieczór filmowy
                        </span>
                    </div>

                    <div className="vhs-badge mt-1 text-text-light">
                        Nazwij wydarzenie — załoga zaproponuje filmy gdy dołączą.
                    </div>
                </div>

                {error && (
                    <div className="vhs-badge text-neon-pink">{error}</div>
                )}

                {[
                    {
                        label: "NAZWA WYDARZENIA",
                        placeholder: "np. Piątkowy wieczór",
                        value: name,
                        onChange: setName,
                    },
                    {
                        label: "LOKACJA",
                        placeholder: "np. U Krzysia",
                        value: venue,
                        onChange: setVenue,
                    },
                ].map((f) => (
                    <div key={f.label}>
                        <div className="vhs-badge mb-2 text-neon-blue">
                            {f.label}
                        </div>

                        <input
                            value={f.value}
                            onChange={(e) => f.onChange(e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full rounded-sm border border-border bg-[#0e0e1a] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880] focus:shadow-[0_0_10px_#ff2d7820]"
                        />
                    </div>
                ))}

                <button onClick={() => handleCreateNight()} disabled={!canLaunch} className={`w-full rounded-sm py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] transition-all ${canLaunch ? "cursor-pointer border-2 border-neon-pink bg-[#ff2d7818] text-neon-pink shadow-[0_0_20px_#ff2d7840] hover:bg-[#ff2d7825]" : "cursor-not-allowed border border-[#1e1e38] bg-[#0e0e1a] text-[#333360]"}`}>
                    ▶ UTWÓRZ WIECZÓR FILMOWY
                </button>
            </div>
        </div>
    )
}
export default CreatePage;