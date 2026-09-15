"use client";
import { useState} from "react";

const CreatePage = () => {

    const [canLaunch, setCanLaunch] = useState(false);
    const [name, setName] = useState("");
    const [venue, setVenue] = useState("");

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
                            className="w-full rounded-sm border border-[#1e1e38] bg-[#0e0e1a] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880] focus:shadow-[0_0_10px_#ff2d7820]"
                        />
                    </div>
                ))}

                <button className={`w-full rounded-sm py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] transition-all ${canLaunch ? "cursor-pointer border-2 border-neon-pink bg-[#ff2d7818] text-neon-pink shadow-[0_0_20px_#ff2d7840] hover:bg-[#ff2d7825]" : "cursor-not-allowed border border-[#1e1e38] bg-[#0e0e1a] text-[#333360]"}`}>
                    ▶ UTWÓRZ WIECZÓR FILMOWY
                </button>
            </div>
        </div>
    )
}
export default CreatePage;