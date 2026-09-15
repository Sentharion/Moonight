import { useState } from "react";
import { DateProposalWithUser, dateSampleData } from "../../../../constant";
import Bar from "../../components/Bar";
import DatePicker from "./DatePicker";
import { dateFormat } from "../../../../utils/dateFormat";
import { X } from "lucide-react";



const DateVoteTab = () => {
    const [showDateForm, setShowDateForm] = useState(false);
    const [datePropList, setDatePropList] = useState<DateProposalWithUser[]>(dateSampleData);
    const [votedDate, setVotedDate] = useState<string[]>([]);
    const [deleteMode, setDeleteMode] = useState(false);

    const maxDateProp = datePropList.length > 0 ? Math.max(...datePropList.map((d) => d.votes)) : 0;

    const addDateProp = (date: Date, time: string) => {
        const newDate:DateProposalWithUser = {
            id: crypto.randomUUID(),
            roomId: "1",
            proposedBy: "Host",
            date: `${dateFormat(date,time)}`,
            votes: 0,
            createdAt: new Date().toISOString(),
            proposer: {
                id: "user-1",
                username: "Host",
                avatar: "avatar-1",
                createdAt: new Date().toISOString()
            }
        }

        setDatePropList((prev)=>[...prev, newDate]);
        setShowDateForm(false);
    }

    const deleteProp = (id:string)=>{
        if(deleteMode === true) {
            setDatePropList((prev)=> prev.filter((v) => v.id !== id));
        } else {
            return null;
        }
    }

    const voteDateProp = (id: string) => {
        if(deleteMode !== true) {
            setVotedDate((prev)=> prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
            setDatePropList((prev)=> prev.map((v)=> v.id === id ? {...v, votes: votedDate.includes(id) ? v.votes - 1 : v.votes + 1} : v));
        } else {
            return null;
        }
    };

    const toggleDeleteMode = () => {
        setDeleteMode((prev) => !prev);
    };



    return (
        <section>
            <div className="mb-4">
                <div className="font-russo uppercase text-[20px] tracking-[0.04em] text-white">
                    Wybierz{" "}
                    <span className="text-neon-blue drop-shadow-[0_0_12px_#00e5ff]">
                        Termin
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    {datePropList.length === 0
                    ? "Nie ma jeszcze zaproponowanych dat — dodaj poniżej"
                    : "Zagłosuj na termin wieczoru filmowego"}
                </div>
            </div>

            <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className={`uppercase vhs-badge text-neon-blue ${deleteMode ? "text-red-500" : "text-neon-blue"}`}>
                        Propozycje dat {deleteMode ? "(tryb usuwania)" : ""}
                    </span>

                    <div className="flex gap-2">
                            <button
                                onClick={() => setShowDateForm((v) => !v)}
                                className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-neon-blue/10 text-neon-blue transition-all ${showDateForm ? "border-neon-blue/35 bg-neon-blue/10": "border-neon-blue/35 bg-transparent"}`}
                            >
                                {showDateForm ? "✕ Anuluj" : "+ Dodaj"}
                            </button>
                           {!showDateForm && 
                           <button onClick={toggleDeleteMode} className={`vhs-badge uppercase rounded-sm border px-2.5 py-1 cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500 ${deleteMode ? "border-red-500/35 bg-red-500/10" : "border-red-500/35 bg-transparent"}`}>
                                ✕ Usuń
                            </button>
                           }
                    </div>
                </div>

                {showDateForm && (
                    <div className="flex flex-col justify-center gap-2 rounded-sm border border-neon-blue/20 bg-[#0e0e1a] p-3">
                        <div className="flex justify-center">
                            <DatePicker onAddDate={addDateProp} showDateForm={showDateForm} />
                        </div>
                    </div>
                )}
            </div>

            {datePropList.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-[#1e1e38] bg-[#0e0e1a] py-8">
                    <div className="text-[28px] opacity-30">
                        📅
                    </div>

                    <div className="vhs-badge uppercase text-center text-[#333360]">
                        Nie ma propozycji dat
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {datePropList.map((d) => {
                        const picked = votedDate.includes(d.id);
                        const leading = d.votes === maxDateProp && d.votes > 0;

                        return (
                            <button
                                key={d.id}
                                onClick={() => voteDateProp(d.id)}
                                className={`w-full rounded-sm p-4 text-left transition-all duration-200 ${picked ? "border-2 border-neon-blue bg-[#001a20] shadow-[0_0_18px_#00e5ff25]" : leading && votedDate && !deleteMode ? "border border-neon-blue/25 bg-[#0e0e1a]" : "border border-[#1e1e38] bg-[#0e0e1a]"} ${deleteMode ? "cursor-default" : "cursor-pointer"}`}
                            >
                                <div className="mb-2.5 flex items-center justify-between">
                                    <div>
                                        <span className={`font-mono text-[14px] ${picked ? "text-neon-blue" : "text-[#e8e0ff]"}`}>
                                            {d.date}
                                        </span>

                                        <div className="vhs-badge mt-0.5 text-[#333360]">
                                            proponowane przez {d.proposedBy}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {leading && votedDate !== null && !deleteMode && (
                                            <span className="vhs-badge rounded-sm uppercase bg-neon-blue px-1.5 py-0.5 text-text-light">
                                                Wygrywa
                                            </span>
                                        )}

                                        {picked && (
                                            <span className="text-neon-blue">
                                                ✓
                                            </span>
                                        )}

                                        {
                                            deleteMode ? (
                                                <button onClick={() => deleteProp(d.id)} className="vhs-badge uppercase rounded-sm border py-1 px-1.5 text-center cursor-pointer hover:bg-red-500/20 border-red-500 bg-transparent text-red-500">
                                                    <X size={12}/>
                                                </button>
                                            ) : (
                                                <span className={`vhs-badge ${picked ? "text-neon-blue" : "text-text-light"}`}>
                                                    {d.votes}
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>

                                <Bar
                                    val={d.votes}
                                    max={maxDateProp || 1}
                                    color={picked ? "#00e5ff" : "#1a1a40"}
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {votedDate.length > 0 && (
                <div className="mt-4 rounded-sm border border-neon-blue/25 bg-neon-blue/5 p-3 text-center vhs-badge text-neon-blue">
                    ZAGŁOSOWANO NA — {datePropList
                        .filter((d) => votedDate.includes(d.id))
                        .map((d) => d.date)
                        .join(", ")
                        .toUpperCase()}
                </div>
            )}
        </section>
    )
}

export default DateVoteTab