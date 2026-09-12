"use client";
import Ticker from "./Ticker";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
const TopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <header className={`mt-1 bg-[#0a0a14] ${pathname === "/create" ? "border-b-2 border-neon-pink" : ""}`}>
      <div className={`mx-auto flex  max-w-7xl items-center gap-3 px-7 sm:px-7 py-3 sm:max-w-2xl sm:py-2 ${pathname === "/" ? "hidden" : "flex"}`}>
        
        <div className="glitch font-russo text-[22px] tracking-wider font-light text-neon-pink glow-pink sm:text-[24px]!">
          MOONIGHT 
        </div>

        <div className="vhs-badge text-text-light text-[10px]! sm:text-[12px]!">
          <span className="blink text-text-light">●</span>{" "}
          OCZEKIWANIE
        </div>

        {pathname === "/create" && 
          <button className="hidden sm:block sm:ml-auto vhs-badge cursor-pointer shrink-0 uppercase rounded-sm border border-neon-pink/50 bg-transparent px-2.5 py-1.5 leading-none text-neon-pink transition-all hover:border-neon-pink hover:bg-[#ff2d7810]" onClick={router.back}>
            Powrót →
          </button>
        }
      </div>

      {pathname !== "/create" && pathname !== "/" && <Ticker titles={["BRAK SYGNAŁU"]} />}
    </header>
  );
};

export default TopBar;