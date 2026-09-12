import { CirclePlus, CalendarPlus, DiamondIcon, User, Vote, UserPlus } from "lucide-react"
export type Tab = {
    id: number,
    label: string,
    path: string,
    icon: React.ReactNode
}
export const PreTabs: Tab[] = [
    {
        id: 1,
        label: 'Przegląd',
        path: '/dashboard',
        icon: <DiamondIcon className="size-4" />
    },
    {
        id: 2,
        label: 'Dołącz',
        path: '/join',
        icon: <CalendarPlus className="size-4" />
    },
    {
        id: 3,
        label: 'Stwórz',
        path: '/create',
        icon: <CirclePlus className="size-4" />
    },
    {
        id: 4,
        label: 'Profil',
        path: '/profile',
        icon: <User className="size-4" />
    }
]
export const Tabs: Tab[] = [
    {
        id: 1,
        label: 'Przegląd',
        path: '/[room]/lineup',
        icon: <DiamondIcon className="size-4" />
    },
    {
        id: 2,
        label: 'Głosuj',
        path: '/vote',
        icon: <Vote className="size-4" />
    },
    {
        id: 3,
        label: 'Zaproś',
        path: '/[room]/invite',
        icon: <UserPlus className="size-4" />
    },
    {
        id: 4,
        label: 'Profil',
        path: '/profile',
        icon: <User className="size-4" />
    }
]

export interface MovieRoom {
    id: string,
    title: string,
    venue: string,
    inviteCode: string,
    createdAt: string,
    hostId: string,
}

export interface User {
    id: string,
    username: string,
    avatar: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface MovieRoomParticipant {
    roomId: string,
    userId: string,
    role: "host" | "participant"
}

export interface MovieProposal {
    id: string,
    roomId: string,
    proposedBy: string,
    movieId: string,
    title: string,
    posterUrl: string
    updatedAt: Date,
}

export interface DateProposal {
    id: string,
    roomId: string,
    proposedBy: string,
    date: string,
    createdAt: string,
    updatedAt: string,
}

export interface MovieVote {
    id: string;
    movieProposalId: string;
    userId: string;
    createdAt: Date;
}

export interface DateVote {
    id: string;
    dateProposalId: string;
    userId: string;
    createdAt: Date;
}
