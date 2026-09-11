"use client"
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {CirclePlus,CalendarPlus,DiamondIcon,User,Vote,UserPlus} from "lucide-react"

const PreTabs = [
    {
        id:1,
        label:'Przegląd',
        path:'/',
        icon:<DiamondIcon className="size-4" />
    },
    {
        id:2,
        label:'Dołącz',
        path:'/join',
        icon:<CalendarPlus  className="size-4"/>
        },
        {
            id:3,
            label:'Stwórz',
            path:'/create',
            icon:<CirclePlus className="size-4"/>
        },
        {
            id:4,
            label:'Profil',
            path:'/profile',
            icon:<User className="size-4"/>
        }
    ]
    const Tabs = [
        {
            id:1,
            label:'Przegląd',
            path:'/[room]/lineup',
            icon:<DiamondIcon className="size-4" />
        },
        {
            id:2,
            label:'Głosuj',
            path:'/vote',
            icon:<Vote className="size-4"/>
        },
        {
            id:3,
            label:'Zaproś',
            path:'/[room]/invite',
            icon:<UserPlus className="size-4"/>
        },
        {
            id:4,
            label:'Profil',
            path:'/profile',
            icon:<User className="size-4"/>
        }
    ]

const NavBar = ()=>{
    const pathname = usePathname();
    const params = useParams();
    const room = params?.room as string | undefined;

    const currentTabs = room ? Tabs : PreTabs;

    return(
        <nav className="hidden sm:flex sm:justify-center max-w-2xl mx-auto w-full px-4 pt-4 gap-2">
            {currentTabs.map((item) => {
                const resolvedPath = item.path.replace('[room]', room || '');
                const isActive = pathname === resolvedPath;
                return (
                    <Link key={item.id} href={resolvedPath} className={`flex items-center gap-2 py-3 text-center px-7 rounded-sm vhs-badge font-barlow! transition-all duration-150 ${isActive ? "bg-neon-pink/10! border-2 border-neon-pink text-neon-pink shadow-[0_0_14px_#ff2d7850]" : "bg-[#0e0e1a]! border border-[#1e1e38]! text-text-light! hover:border-neon-pink/30! hover:text-neon-pink hover:text-neon-pink/50!"}`}>
                        {item.icon}
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
export default NavBar