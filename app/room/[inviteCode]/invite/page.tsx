"use client"
import { useParams } from "next/navigation"
import QrCode from "./components/QrCode"
import CodeJoin from "./components/CodeJoin"

const InvitePage = () => {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    return (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 pb-24 sm:pb-5">
            <div className="flex flex-col gap-5">
                <header>
                    <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-text">
                        Zaproś{" "}
                        <span className="text-neon-pink drop-shadow-[0_0_12px_#ff2d78]">
                            ekipę
                        </span>
                    </div>

                    <div className="vhs-badge mt-1 text-text-light">
                        Udostępnij kod zaproszeniowy lub zeskanuj kod QR, aby dołączyć.
                    </div>
                </header>
                <QrCode />
                <CodeJoin/>
            </div>
        </div>
    )
}

export default InvitePage