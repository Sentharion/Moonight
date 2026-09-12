const Ticker = ({ titles }: { titles: string[] }) => {
  const base = titles.length > 0 ? titles : ["NO SIGNAL"];
  const minItems = 12;
  const times = Math.ceil(minItems / base.length);
  const half = Array.from({ length: times }, () => base).flat();
  const repeated = [...half, ...half];

  return (
    <div className="overflow-hidden border-t-2 border-t-neon-pink border-b border-neon-pink/25 bg-neon-pink/2 py-2 sm:py-2">
      <div className="flex w-max animate-[ticker_40s_linear_infinite] whitespace-nowrap">
        {repeated.map((t, i) => (
          <span
            key={i}
            className="vhs-badge mx-6 text-[11px]! sm:text-[12px]! text-neon-pink/60"
          >
            ▶ {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;