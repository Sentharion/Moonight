
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pt-32 text-center sm:pb-0">
      <div className="relative">
        <div className="font-russo select-none text-[80px] leading-none tracking-[0.02em] text-[#1a1a30]">
          ▶
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-russo text-[76px] leading-none text-neon-pink opacity-[0.12] blur-[8px]">
            ▶
          </div>
        </div>
      </div>

      <div>
        <div className="font-russo text-[20px] uppercase sm:text-[26px] leading-[1.2] tracking-[0.04em] text-[#e8e0ff]">
          Brak zaplanowanego
          <br />
          <span className="text-neon-pink text-[20px] uppercase sm:text-[26px] [text-shadow:0_0_16px_#ff2d78]">
            Seansu
          </span>
        </div>

        <div className="vhs-badge mt-3 text-[12px] sm:text-[16px] text-text-light">
          Zacznij nowy seans — zaproś ekipę, wybierz film i ustal datę.
        </div>
      </div>

      <button className="rounded-sm border-2 cursor-pointer uppercase hover:scale-115 transition-all duration-100 border-neon-pink bg-neon-pink/[0.07] px-4 py-3.5 sm:px-8 sm:py-4 font-russo text-[16px] tracking-[0.08em] text-neon-pink shadow-[0_0_24px_#ff2d7840,inset_0_0_20px_#ff2d7808] active:scale-95">
        ▶ Zaplanuj wieczór filmowy
      </button>

      <div className="flex flex-col gap-2 vhs-badge text-[#9e9eb6] text-[10px] sm:text-[12px]">
        <div>CREATED BY <span className="text-neon-pink">SENTHARION</span></div>
        <div className="text-[#5a5a75]">This product uses the TMDB API but is not endorsed or certified by TMDB.</div>
      </div>

    </div>
  );
}
