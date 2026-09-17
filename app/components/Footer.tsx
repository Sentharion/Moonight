"use client"
import { usePathname } from "next/navigation";
const Footer = () => {
    const path = usePathname();
    return (
        <footer className={`hidden border-t ${path === "/" && `fixed bottom-0 w-full`} border-neon-pink/15 bg-[#080810] sm:block`}>
            <div className={`mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5`}>
                <span className="vhs-badge text-text-light">
                    MOONIGHT SYSTEMS v1.0
                </span>

                <span className="vhs-badge text-text-light">
                    ◈ PLANER WIECZORÓW FILMOWYCH
                </span>
            </div>
        </footer>
    );
}

export default Footer;