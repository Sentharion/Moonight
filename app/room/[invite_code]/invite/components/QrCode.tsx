"use client"
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useParams } from "next/navigation";

const QrCode = () => {
    const [qrRevealed, setQrRevealed] = useState(false);
    const { invite_code } = useParams<{ invite_code: string }>();
    const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${invite_code}`: "";

    return (
        <section className="flex flex-col items-center gap-5 rounded-sm border-2 border-neon-pink/25 bg-card-bg dark:bg-background py-8 shadow-[0_0_30px_#ff2d7818]">
            <div className="vhs-badge uppercase text-neon-pink drop-shadow-[0_0_8px_#ff2d78]">
                ▶ Zeskanuj aby dołączyć!
            </div>

            <div className={`cursor-pointer overflow-hidden rounded-sm bg-white p-4 transition-all duration-300 ${qrRevealed ? "border-[3px] border-neon-pink shadow-[0_0_30px_#ff2d7860]": "border-2 border-[#333]"}`} onClick={() => setQrRevealed(!qrRevealed)}>
                {!qrRevealed ? (
                    <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 bg-card-bg dark:bg-background">
                        <span className="text-[40px] text-neon-pink">
                            ▦
                        </span>
                        <span className="vhs-badge uppercase text-text-light text-center">
                            Naciśnij, aby zobaczyć kod QR
                        </span>
                    </div>
                ) : (
                    <QRCodeSVG
                        value={joinUrl}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="var(--bg)"
                        level="M"
                    />
                )}
            </div>
        </section>
    )
}

export default QrCode