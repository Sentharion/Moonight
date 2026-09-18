export default function Bar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div className="h-1.5 rounded-sm overflow-hidden bg-border dark:bg-[#1e1e38]">
      <div
        className="h-full rounded-sm transition-all duration-700"
        style={{ width: `${Math.round((val / (max + 2)) * 100)}%`, background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}