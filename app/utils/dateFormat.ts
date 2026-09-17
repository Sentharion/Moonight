export const dateFormat = (date:Date,time:string):string =>{
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(time.split(":")[0]);
    const minutes = String(time.split(":")[1]);

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export const dateStringFormat = (date:string):string =>{
    return new Date(date).toLocaleString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
