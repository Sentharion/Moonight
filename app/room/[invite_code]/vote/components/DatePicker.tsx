"use client";

import { useState } from "react";
import { DayPicker } from "@daypicker/react";
import { pl } from "date-fns/locale";
import "@daypicker/react/style.css";

interface DatePickerProps {
    onAddDate: (date: Date, time: string) => void;
    showDateForm: boolean;
}

const DatePicker = ({ onAddDate}: DatePickerProps) => {

    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState("19:00");


    const handleDateChange = (selected: Date | undefined) => {
        setDate(selected);
    };

    const getDateTime = () => {
        if (!date) return null;

        const [hours, minutes] = time.split(":").map(Number);

        const result = new Date(date);
        result.setHours(hours, minutes, 0, 0);

        return result;
    };

    const handleSubmit = () => {
        const dateTime = getDateTime();

        if (!dateTime) return;
        onAddDate(dateTime, time);
        console.log("ISO:", dateTime.toISOString());
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-sm border border-neon-blue/30 bg-card-bg dark:bg-[#0e0e1a] p-3">
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    locale={pl}
                    classNames={{
                        root: "w-full font-mono",
                        months: "relative w-full",
                        month: "w-full",
                        weekdays: "text-neon-blue",
                        weekday: "text-xs uppercase",
                        day_button: "h-9 w-9 rounded-sm transition-all hover:bg-neon-blue/10",
                        selected: "rounded-sm bg-neon-blue/15 text-neon-blue shadow-[0_0_8px_#00e5ff40]",
                        today: "text-neon-blue",
                        outside: "text-text-light opacity-40",
                        caption_label: "uppercase tracking-wider text-foreground dark:text-white",
                        button_previous: "text-foreground dark:text-white hover:bg-neon-blue/10",
                        button_next: "text-foreground dark:text-white hover:bg-neon-blue/10",
                        chevron: "fill-foreground dark:fill-white",
                    }}
                />
            </div>

            <div>
                <label className="vhs-badge mb-1 block text-neon-blue">
                    GODZINA
                </label>

                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-sm border border-neon-blue/40 bg-input-bg dark:bg-[#080810] px-3 py-2.5 font-mono text-[13px] text-foreground dark:text-[#e8e0ff] outline-none focus:border-neon-blue/40"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!date}
                className={`rounded-sm px-4 py-2.5 w-full vhs-badge transition-all ${date ? "cursor-pointer border-2 border-neon-blue bg-neon-blue/10 text-neon-blue" : "cursor-not-allowed border border-border bg-card-bg text-text-light dark:border-[#1e1e38] dark:bg-[#0e0e1a]"}`}
            >
                DODAJ
            </button>
        </div>
    );
};

export default DatePicker;