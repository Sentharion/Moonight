"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {PreTabs, Tabs,type Tab} from "@/app/constant"


const NavBar = ()=>{
    const pathname = usePathname();
    const isRoom = pathname.startsWith("/room/");
    const currentTabs = isRoom ? Tabs : PreTabs;
    const inviteCode = isRoom ? pathname.split("/")[2]: undefined;

    return(
        <nav className="hidden sm:flex sm:justify-center max-w-7xl mx-auto w-full pt-4 gap-2">
            {pathname !== "/create" && pathname !== "/" &&
                currentTabs.map((item:Tab) => {
                    const resolvedPath = item.path.replace('[inviteCode]',inviteCode ?? "");
                    const isActive = pathname === resolvedPath;
                    return (
                        <Link key={item.id} href={resolvedPath} className={`flex items-center gap-2 py-3 text-center ${isRoom ? "px-15" : "px-8.5"} rounded-sm vhs-badge font-barlow! transition-all duration-150 ${isActive ? "bg-neon-pink/10! border-2 border-neon-pink text-neon-pink shadow-[0_0_14px_#ff2d7850]" : "bg-[#0e0e1a]! border border-[#1e1e38]! text-text-light! hover:border-neon-pink/30! hover:text-neon-pink hover:text-neon-pink/50!"}`}>
                            {item.icon}
                            {item.label}
                        </Link>
                    )
                })
            }
        </nav>
    )
}
export default NavBar