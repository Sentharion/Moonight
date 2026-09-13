"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PreTabs, Tabs, type Tab } from "@/app/constant";

const MobileNavbar = () => {
    const pathname = usePathname();

    const isRoom = pathname.startsWith("/room/");
    const currentTabs = isRoom ? Tabs : PreTabs;

    const inviteCode = isRoom
        ? pathname.split("/")[2]
        : undefined;

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-50 border-t-2 border-neon-pink bg-[#0a0a14] shadow-[0_-4px_24px_#ff2d7820] sm:hidden ${
                pathname === "/" ? "hidden" : "flex"
            }`}
        >
            {currentTabs.map((item: Tab) => {
                const resolvedPath = item.path.replace(
                    "[inviteCode]",
                    inviteCode ?? ""
                );

                const active = pathname === resolvedPath;

                return (
                    <Link
                        key={item.id}
                        href={resolvedPath}
                        className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-all ${
                            active
                                ? "bg-neon-pink/6"
                                : "bg-transparent"
                        }`}
                    >
                        <span
                            className={`text-[16px] leading-none ${
                                active
                                    ? "text-neon-pink [text-shadow:0_0_8px_#ff2d78]"
                                    : "text-[#333360]"
                            }`}
                        >
                            {item.icon}
                        </span>

                        <span
                            className={`vhs-badge text-[9px] tracking-[0.12em] ${
                                active
                                    ? "text-neon-pink"
                                    : "text-[#333360]"
                            }`}
                        >
                            {item.label}
                        </span>

                        {active && (
                            <span className="absolute bottom-0 h-0.5 w-8 bg-neon-pink shadow-[0_0_6px_#ff2d78]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileNavbar;