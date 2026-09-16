"use client"
import { MovieRoom, User, SelectedMovie, DateProposal } from "../constant"
import RoomPreview from "../components/RoomPreview"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useState,useEffect } from "react";

interface DashboardRoom {
    room: MovieRoom;
    host: User;
    selectedMovies: SelectedMovie[];
    selectedDate: DateProposal | null;
}

const Dashboard = () => {
  const supabase = createClient();
  const router = useRouter();

  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async ()=>{
      setLoading(true);
      setError("");
      const {data:{user},error:authError } = await supabase.auth.getUser();
      if(authError || !user) {
        router.replace('/');
        return;
      }

      setCurrentUserId(user.id);
      
      const {data:participants,error:participantsError} = await supabase.from('movie_room_participants').select('room_id,movie_room (id,title,venue,invite_code,created_at,host_id,selected_date_id)').eq("user_id",user.id);
      if(participantsError){
        console.error("Błąd przy pobieraniu pokoi:", participantsError);
        setError("⚠ Nie udało się załadować wieczorów");
        setLoading(false);
        return;
      }

      // Build room objects from participant data
      const allRooms: MovieRoom[] = (participants ?? []).flatMap((participant) => {
        const roomData = Array.isArray(participant.movie_room) ? participant.movie_room[0] : participant.movie_room;
        if (!roomData) return [];
        return [{
          id: roomData.id,
          title: roomData.title,
          venue: roomData.venue,
          invite_code: roomData.invite_code,
          created_at: roomData.created_at,
          host_id: roomData.host_id,
          selected_date_id: roomData.selected_date_id,
        }];
      });

      if (allRooms.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }

      // Batch all three lookups in parallel — 3 queries total instead of 3×N
      const hostIds = [...new Set(allRooms.map((r) => r.host_id))];
      const roomIds = allRooms.map((r) => r.id);
      const selectedDateIds = allRooms.map((r) => r.selected_date_id).filter(Boolean) as string[];

      const [hostsResult, moviesResult, datesResult] = await Promise.all([
        supabase.from("users").select("id,username,avatar,created_at").in("id", hostIds),
        supabase.from("selected_movies").select("room_id,movie_proposal_id,position").in("room_id", roomIds).order("position", { ascending: true }),
        selectedDateIds.length > 0
          ? supabase.from("date_proposals").select("*").in("id", selectedDateIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (hostsResult.error) console.error("Błąd przy pobieraniu hostów:", hostsResult.error);
      if (moviesResult.error) console.error("Błąd przy pobieraniu filmów:", moviesResult.error);
      if (datesResult.error) console.error("Błąd przy pobieraniu dat:", datesResult.error);

      // Index results by ID for O(1) lookup
      const hostsById = Object.fromEntries((hostsResult.data ?? []).map((h) => [h.id, h]));
      const moviesByRoom = (moviesResult.data ?? []).reduce<Record<string, SelectedMovie[]>>((acc, m) => {
        (acc[m.room_id] ??= []).push(m as SelectedMovie);
        return acc;
      }, {});
      const datesById = Object.fromEntries((datesResult.data ?? []).map((d) => [d.id, d]));

      const dashboarddRooms: DashboardRoom[] = allRooms.flatMap((room) => {
        const host = hostsById[room.host_id];
        if (!host) return [];
        return [{
          room,
          host: host as User,
          selectedMovies: moviesByRoom[room.id] ?? [],
          selectedDate: room.selected_date_id ? (datesById[room.selected_date_id] as DateProposal ?? null) : null,
        }];
      });

      setRooms(dashboarddRooms);
      setLoading(false);
    }
    loadRooms();
  }, [router,supabase]);

  const handleCreateRoom=()=>{
    router.push("/create");
  }

  const handleDeleteRoom = (roomId: string) => { setRooms((prev) => prev.filter((room) => room.room.id !== roomId) ); };


  if (loading) {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="vhs-badge animate-pulse text-neon-pink">
                ŁADOWANIE WIECZORÓW...
            </div>
        </div>
    );
}

  
  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-8 px-6 pt-32 text-center sm:pb-0">
      {
      rooms.length > 0 ? (
          <div className="flex flex-col w-full max-w-2xl sm:max-w-150 -translate-y-25">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-[0.15em] text-neon-blue">
                Twoje wieczory
              </span>
              <Link href="/create" className="vhs-badge uppercase cursor-pointer rounded-sm border border-neon-pink/20 bg-[#ff2d7810] px-3 py-1.5 text-neon-pink transition-all hover:border-neon-pink hover:bg-[#ff2d7820]">
                + Nowy wieczór
              </Link>
            </div>
            <div className="flex flex-col gap-4">
                {rooms.map((room) => (
                <RoomPreview key={room.room.id} room={room.room} host={room.host} selectedDate={room.selectedDate} selectedMovies={room.selectedMovies} currentUserId={currentUserId}  onDelete={handleDeleteRoom}/>
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="font-russo select-none text-[80px] leading-none tracking-[0.02em] text-[#1a1a30]">
                ▶
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-russo text-[76px] leading-none text-neon-pink opacity-[0.12] blur-sm">
                  ▶
                </div>
              </div>
            </div>

            <div>
              <div className="font-russo text-[20px] uppercase sm:text-[26px] leading-[1.2] tracking-[0.04em] text-[#e8e0ff]">
                Brak zaplanowanego
                <br />
                <span className="text-neon-pink text-[20px] uppercase sm:text-[26px] [text-shadow:0_0_16px_#ff2d78]">
                  Seansu
                </span>
              </div>

              <div className="vhs-badge mt-3 text-[12px] sm:text-[16px] text-text-light">
                Zacznij nowy seans — zaproś ekipę, wybierz film i ustal datę.
              </div>
            </div>

            <button onClick={handleCreateRoom} className="rounded-sm border-2 cursor-pointer uppercase hover:scale-115 transition-all duration-100 border-neon-pink bg-neon-pink/[0.07] px-4 py-3.5 sm:px-8 sm:py-4 font-russo text-[16px] tracking-[0.08em] text-neon-pink shadow-[0_0_24px_#ff2d7840,inset_0_0_20px_#ff2d7808] active:scale-95">
              ▶ Zaplanuj wieczór filmowy
            </button>
          </>
        )
      }
    </div>
  );
}

export default Dashboard;
