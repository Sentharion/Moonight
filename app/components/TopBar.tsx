"use client";
import Ticker from "./Ticker";
import { useEffect } from "react";
const TopBar = () => {
  useEffect(() => {
  console.log("TOPBAR MOUNT");

  return () => {
    console.log("TOPBAR UNMOUNT");
  };
  }, []);
  return (
    <header className="mt-1 bg-[#0a0a14]">
      <div className="mx-auto flex  max-w-3xl items-center gap-3 px-4 sm:px-13 py-3 sm:max-w-2xl sm:py-2">
        
        <div className="glitch font-russo text-[22px] tracking-wider font-light text-neon-pink glow-pink sm:text-[24px]!">
          MOONIGHT 
        </div>

        <div className="vhs-badge text-text-light text-[10px]! sm:text-[12px]!">
          <span className="blink text-text-light">●</span>{" "}
          OCZEKIWANIE
        </div>

      </div>

      <Ticker titles={["BRAK SYGNAŁU"]} />
    </header>
  );
};

export default TopBar;