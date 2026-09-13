import { crewSampleData } from "../../../constant";
import Image from "next/image";

const Crew = () => {
    return (
        <section>
          <div className="mb-3 mt-3 flex items-center justify-between">
            <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                Załoga
            </span>

            <button className="vhs-badge cursor-pointer uppercase text-neon-pink hover:text-neon-pink/60">
                + Zaproś
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {crewSampleData.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 rounded-sm border border-[#1e1e38] bg-[#0e0e1a] px-3 py-2">

                    {
                        c.avatar ? (
                            <Image src={c.avatar} alt={c.username} width={30} height={30} className="block h-23.75 w-17.5 rounded-sm object-cover"/>
                        ) : (
                            <div className="vhs-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#ff2d7840] bg-[#1a0a2e] text-neon-pink">
                                {c.username.slice(0,2).toUpperCase()}
                            </div>
                        )
                    }

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-text-light">
                            {c.username}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </section>
    );
};

export default Crew;