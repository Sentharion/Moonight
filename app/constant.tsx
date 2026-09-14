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
    inviteCode: string,
    createdAt: string,
    hostId: string,
    selectedDateId: string | null
}

export interface User {
    id: string,
    username: string,
    avatar?: string,
    createdAt: string,
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
    year:string,
    posterUrl?: string
    createdAt: string;
}

export interface DateProposal {
    id: string,
    roomId: string,
    proposedBy: string,
    date: string,
    createdAt: string,
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

export interface SelectedMovie {
    roomId: string;
    movieProposalId: string;
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
    year: string;
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
    Year: string;
    imdbID: string;
    Type: "movie";
    Poster: string;
}

export const moviesSampleData: MovieProposal[] = [
    {
        id: "1",
        roomId: "1",
        proposedBy: "1",
        movieId: "1",
        title: "Incepcja",
        year:"2010",
        posterUrl: "https://image.tmdb.org/t/p/w500/86c5eSly9fJ23mD6lF7M9b1m5l0.jpg",
        createdAt: "2022-01-01",
    }
]


export const roomsSampleData: MovieRoomPreviewData[] = [
    {
        id: "1",
        title: "PIĄTKOWY SEANS",
        venue: "Mieszkanie",
        inviteCode: "ABC123",
        hostId: "user-1",
        selectedDateId: null,
        createdAt: "2026-09-12T18:00:00Z",

        host: {
            id: "user-1",
            username: "Michał",
            avatar: "avatar-1",
            createdAt: new Date().toISOString()
        },
        crew: [
            {
                roomId: "1",
                userId: "user-1",
                role: "host"
            },
            {
                roomId: "1",
                userId: "user-2",
                role: "participant"
            },
            {
                roomId: "1",
                userId: "user-3",
                role: "participant"
            }
        ],
        selectedDate: null,

        selectedMovies: [
            {
                roomId: "1",
                movieProposalId: "1",
                position: 1,
            }
        ],

        leading: {
            id: "1",
            roomId: "1",
            proposedBy: "user-2",
            movieId: '123',
            title: "Interstellar",
            year:"2014",
            posterUrl: "/interstellar.jpg",
            createdAt: "2026-09-12T18:00:00Z",
        },
    },
];


export const propositionsSampleData: MovieProposalWithUser[] = [
  {
    id: "1",
    roomId: "1",
    movieId: "1",
    title: "Blade Runner 2049",
    year: '2017',
    posterUrl:"https://fwcdn.pl/fpo/07/98/630798/7801880_1.3.jpg",
    proposedBy: "Host",
    createdAt: "2026-09-12T18:00:00Z",
    votes: 5,
    proposer: {
        id: "user-1",
        username: "Host",
        avatar: "avatar-1",
        createdAt: new Date().toISOString()
    }
  },
  {
    id:"2",
    roomId: "1",
    movieId: "2",
    title: "Drive",
    year: '2011',
    proposedBy: "Crew",
    createdAt: "2026-09-12T18:00:00Z",
    votes: 3,
    proposer: {
        id: "user-2",
        username: "Crew",
        avatar: "avatar-2",
        createdAt: new Date().toISOString()
    }
  },
  {
    id: "3",
    roomId: "1",
    movieId: "3",
    title: "Akira",
    year: '1988',
    proposedBy: "Crew",
    createdAt: "2026-09-12T18:00:00Z",
    votes: 2,
    proposer: {
        id: "user-3",
        username: "Crew",
        avatar: "avatar-3",
        createdAt: new Date().toISOString()
    }
  },
];

export const dateSampleData: DateProposalWithUser[] = [
    {
        id: "1",
        roomId: "1",
        proposedBy: "Host",
        date: "2022-01-01",
        createdAt: "2022-01-01",
        votes: 5,
        proposer: {
            id: "user-1",
            username: "Host",
            avatar: "avatar-1",
            createdAt: new Date().toISOString()
        }
    },
    {
        id: "2",
        roomId: "1",
        proposedBy: "Crew",
        date: "2022-01-01",
        createdAt: "2022-01-01",
        votes: 3,
        proposer: {
            id: "user-2",
            username: "Crew",
            avatar: "avatar-2",
            createdAt: new Date().toISOString()
        }
    },
    {
        id: "3",
        roomId: "1",
        proposedBy: "Crew",
        date: "2022-01-01",
        createdAt: "2022-01-01",
        votes: 2,
        proposer: {
            id: "user-3",
            username: "Crew",
            avatar: "avatar-3",
            createdAt: new Date().toISOString()
        }
    },
];

export const crewSampleData: User[] = [
    {
        id: "1",
        username: "Krzysiu",
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        username: "Gosia",
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        username: "Ania",
        createdAt: new Date().toISOString(),
    },
]