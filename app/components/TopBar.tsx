import Ticker from "./Ticker";

const TopBar = () => {
  return (
    <header className="mt-1 bg-[#0a0a14]">
      <div className="mx-auto flex  max-w-3xl items-center gap-3 px-4 sm:px-22 py-3 sm:max-w-2xl sm:py-1">
        
        <div className="glitch font-russo text-[22px] tracking-wider text-neon-pink glow-pink sm:text-[16px]!">
          MOONIGHT 
        </div>

        <div className="vhs-badge text-[#555580] tracking-[2px] text-[10px]! sm:text-[8px]!">
          <span className="blink text-[#555580]">●</span>{" "}
          STANDBY
        </div>

      </div>

      <Ticker titles={["NO SIGNAL"]} />
    </header>
  );
};

export default TopBar;