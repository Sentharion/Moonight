import {CirclePlus,CalendarPlus,DiamondIcon,User,Vote,UserPlus} from "lucide-react"
export type Tab ={
    id:number,
    label:string,
    path:string,
    icon:React.ReactNode
}
export const PreTabs:Tab[] = [
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
    export const Tabs:Tab[] = [
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