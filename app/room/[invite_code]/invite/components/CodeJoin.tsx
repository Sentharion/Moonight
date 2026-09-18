"use client"
import { useState } from "react"
import { useParams } from "next/navigation"

const CodeJoin = () => {
    const { invite_code } = useParams<{ invite_code: string }>();
    const [copied, setCopied] = useState(false);
    const copyLink = () => {
        navigator.clipboard.writeText(invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <section className="rounded-sm border border-border bg-card-bg dark:bg-background p-4">
            <div className="vhs-badge mb-3 uppercase text-neon-blue">
                Kod zaproszeniowy
            </div>

            <div className="flex gap-2">
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-sm border border-border bg-input-bg dark:bg-background px-3 py-2.5 font-mono text-[11px] text-foreground dark:text-[#e8e0ff]">
                    {invite_code}
                </div>

                <button
                    onClick={copyLink}
                    className={`vhs-badge shrink-0 rounded-sm cursor-pointer uppercase px-4 py-2.5 transition-all ${
                        copied
                            ? "border-2 border-neon-lime bg-neon-lime/10 text-neon-lime shadow-[0_0_12px_#b8ff0040]"
                            : "border-2 border-neon-blue bg-neon-blue/10 text-neon-blue shadow-[0_0_12px_#00e5ff30]"
                    }`}
                >
                    {copied ? "✓ Skopiowano" : "Kopiuj"}
                </button>
            </div>
        </section>
    )
}

export default CodeJoin