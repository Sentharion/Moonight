"use client";
import Ticker from "./Ticker";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase/client";

const TopBar = () => {
  const pathname = usePathname();
  const supabase = createClient();
  const [roomTitle, setRoomTitle] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!pathname.startsWith("/room/")) {
      setRoomTitle(null);
      return;
    }

    const segments = pathname.split("/");
    const inviteCode = segments[2];

    if (!inviteCode) {
      setRoomTitle(null);
      return;
    }

    if (cacheRef.current[inviteCode]) {
      setRoomTitle(cacheRef.current[inviteCode]);
      return;
    }

    const loadTitle = async () => {
      const { data } = await supabase
        .from("movie_room")
        .select("title")
        .eq("invite_code", inviteCode)
        .single();

      if (data?.title) {
        const formatted = data.title.toUpperCase();
        cacheRef.current[inviteCode] = formatted;
        setRoomTitle(formatted);
      }
    };

    loadTitle();
  }, [pathname, supabase]);

  return (
    <header className={`mt-1 bg-[#0a0a14] ${pathname === "/create" ? "border-b-2 border-neon-pink" : ""}`}>
      <div className={`mx-auto flex max-w-7xl items-center gap-3 px-7 sm:px-7 py-3 sm:max-w-2xl sm:py-2 ${pathname === "/" ? "hidden" : "flex"}`}>

        <div className="glitch font-russo text-[22px] tracking-wider font-light text-neon-pink glow-pink sm:text-[24px]!">
          MOONIGHT
        </div>

        {
          pathname === "/dashboard" || pathname === "/join" || pathname === "/profile" ? (
            <div className="vhs-badge text-text-light text-[10px]! sm:text-[12px]!">
              <span className="blink text-text-light">●</span>{" "}
              OCZEKIWANIE
            </div>
          ) : pathname.startsWith("/room/") ? (
            <div className="vhs-badge text-neon-blue text-[10px]! sm:text-[12px]!">
              <span className="blink uppercase text-neon-blue">●</span>{" "}
              Aktywny
            </div>
          ) : pathname.startsWith("/create") ? (
            <div className="vhs-badge text-neon-blue text-[10px]! sm:text-[12px]!">
              <span className="blink uppercase text-neon-blue">●</span>{" "}
              Nowy seans
            </div>
          ) : null
        }

        {(pathname === "/create" || pathname.startsWith("/room/")) ? (
          <Link href="/dashboard" className={`${pathname === "/room/" ? "block" : "ml-auto"} vhs-badge cursor-pointer shrink-0 uppercase rounded-sm border border-neon-pink/50 bg-transparent px-2.5 py-1.5 leading-none text-neon-pink transition-all hover:border-neon-pink hover:bg-[#ff2d7810]`}>
            Powrót →
          </Link>
        ) : null}
      </div>

      {pathname !== "/create" && pathname !== "/" && (
        <Ticker
          titles={
            pathname.startsWith("/room/")
              ? [roomTitle || "ŁADOWANIE SEANSU..."]
              : ["BRAK SYGNAŁU"]
          }
        />
      )}
    </header>
  );
};

export default TopBar;