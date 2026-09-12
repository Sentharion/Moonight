"use client"
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {PreTabs, Tabs,type Tab} from "@/app/constant"

const MobileNavbar = () =>{
    const pathname = usePathname();
    const params = useParams();
    const room = params?.room as string | undefined;

    const currentTabs = room ? Tabs : PreTabs;
    return(
       <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t-2 border-neon-pink bg-[#0a0a14] shadow-[0_-4px_24px_#ff2d7820] sm:hidden">
        {currentTabs.map((item: Tab) => {
            const active = pathname === item.path;
                return (
                <Link key={item.id} href={item.path} className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-all ${active ? "bg-neon-pink/6" : "bg-transparent"}`}>
                    <span
                        className={`text-[16px] leading-none ${active ? "text-neon-pink [text-shadow:0_0_8px_#ff2d78]" : "text-[#333360]"}`}
                    >
                        {item.icon}
                    </span>
                    <span className={`vhs-badge text-[9px] tracking-[0.12em] ${active ? "text-neon-pink" : "text-[#333360]"}`}>
                        {item.label}
                    </span>
                    {active && (
                        <span className="absolute bottom-0 h-0.5 w-8 bg-neon-pink shadow-[0_0_6px_#ff2d78]" />
                    )}
                </Link>
            );
        })}
       </nav>
    )
}
export default MobileNavbar