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
        path: '/room/[inviteCode]',
        icon: <DiamondIcon className="size-4" />
    },
    {
        id: 2,
        label: 'Głosuj',
        path: '/room/[inviteCode]/vote',
        icon: <Vote className="size-4" />
    },
    {
        id: 3,
        label: 'Zaproś',
        path: '/room/[inviteCode]/invite',
        icon: <UserPlus className="size-4" />
    },
]

export interface MovieRoom {
    id: string,
    title: string,
    venue: string,
    invite_code: string,
    created_at: string,
    host_id: string,
    selected_date_id: string | null
    date_voting_active:boolean
}

export interface User {
    id: string,
    username: string,
    avatar?: string,
    created_at: string,
}

export interface MovieRoomParticipant {
    room_id: string,
    user_id: string,
    role: "host" | "participant"
}

export interface MovieProposal {
    id: string,
    room_id: string,
    proposed_by: string,
    movie_id: string,
    title: string,
    year?:string,
    poster_url?: string
    created_at: string;
}

export interface DateProposal {
    id: string,
    room_id: string,
    proposed_by: string,
    date: string,
    created_at: string,
}

export interface MovieVote {
    id: string;
    movie_proposal_id: string;
    user_id: string;
    created_at: Date;
}

export interface DateVote {
    id: string;
    date_proposal_id: string;
    user_id: string;
    created_at: Date;
}

export interface SelectedMovie {
    room_id: string;
    movie_proposal_id: string;
    position: number;
}


export interface MovieRoomPreviewData extends MovieRoom {
    host: User;
    selectedDate: DateProposal | null;
    selectedMovies: SelectedMovie[];
    crew: MovieRoomParticipant[];
    leading: MovieProposal;
}

/* Typy do JOIN */

export interface MovieRoomWithHost extends MovieRoom {
    host: User;
}

export interface MovieProposalWithUser extends MovieProposal {
    proposer: User;
    votes: number;
}

export interface DateProposalWithUser extends DateProposal {
    proposer: User;
    votes: number;
}

export interface MovieRoomDetails extends MovieRoom {
    host: User;
    participants: MovieRoomParticipant[];
    movieProposals: MovieProposalWithUser[];
    dateProposals: DateProposalWithUser[];
    selectedMovies: SelectedMovie[];
}

/* Forumlarze */

export interface RegisterForm {
    username: string;
    password: string;
    confirmPassword: string;
}

export interface LoginForm {
    username: string;
    password: string;
}

export type VoteTab = "movies" | "dates";

export interface MovieSearchResult {
    id: string;
    title: string;
    year: number;
    type: "movie" | "series";
    poster: string | null;
}

export interface ReelDBMovie {
    Title: string;
    Year?: string;
    imdbID?: string;
    Type?: "movie";
    Poster?: string;
}

export interface MovieRoomParticipantWithUser extends MovieRoomParticipant {
    users: User;
}
