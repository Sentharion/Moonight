import { roomsSampleData } from "../constant"
import RoomPreview from "../components/RoomPreview"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-8 px-6 pt-32 text-center sm:pb-0">
      {
        roomsSampleData.length > 0 ? (
          <div className="flex flex-col w-full max-w-2xl sm:max-w-150 -translate-y-25">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                Twoje wieczory
              </span>
              <Link href="/create" className="vhs-badge uppercase cursor-pointer rounded-sm border border-neon-pink/20 bg-[#ff2d7810] px-3 py-1.5 text-neon-pink transition-all hover:border-neon-pink hover:bg-[#ff2d7820]">
                + Nowy wieczór
              </Link>
            </div>
            {roomsSampleData.map((room) => (
              <RoomPreview key={room.id} room={room} host={room.host} selectedDate={room.selectedDate} selectedMovies={room.selectedMovies} />
            ))}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="font-russo select-none text-[80px] leading-none tracking-[0.02em] text-[#1a1a30]">
                ▶
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-russo text-[76px] leading-none text-neon-pink opacity-[0.12] blur-sm">
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
          </>
        )
      }
    </div>
  );
}
