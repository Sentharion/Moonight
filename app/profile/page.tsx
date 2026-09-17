"use client"
import { useEffect, useState, useRef } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import Image from "next/image";


import { ensureUserProfile } from "../lib/queries/user";

const ProfilePage = () => {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [profileEditing, setProfileEditing] = useState(false);
    const [usernameDraft, setUsernameDraft] = useState("");
    const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError("");

            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setError("Brak dostępu do profilu");
                setLoading(false);
                router.replace("/")
                return;
            }

            let profile = await ensureUserProfile(supabase, user);

            if (!profile) {
                const { data, error: profileError } = await supabase
                    .from("users")
                    .select("username,avatar")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    console.error("Błąd profilu: ", profileError);
                    setError("Nie udało się pobrać profilu");
                    setLoading(false);
                    return;
                }

                profile = data as any;
            }

            setUsername(profile?.username ?? "");
            setAvatar(profile?.avatar ?? null);
            setLoading(false);
        };
        loadProfile();
    }, [router, supabase]);

    const startEditing = () => {
        setUsernameDraft(username);
        setAvatarDraft(avatar);
        setAvatarFile(null);
        setProfileEditing(true);
        setError("");
    }

    const cancelEditing = () => {
        setUsernameDraft(username);
        setAvatarDraft(avatar);
        setAvatarFile(null);
        setProfileEditing(false);
        setError("");
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const maxSize = 5 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            setError("⚠ Akceptowane formaty: JPG, PNG, WEBP");
            return;
        }

        if (file.size > maxSize) {
            setError("⚠ Maksymalny rozmiar: 5 MB");
            return;
        }

        setError("");
        setAvatarFile(file);

        const previewUrl = URL.createObjectURL(file);
        setAvatarDraft(previewUrl);


    }

    const saveProfile = async () => {
        const normalizedUser = usernameDraft.trim();

        if (!normalizedUser) {
            setError("⚠ Nazwa użytkownika nie może być pusta");
            return;
        }

        if (normalizedUser.length > 16) {
            setError("⚠ Nazwa użytkownika musi mieć maksymalnie 16 znaków");
            return;
        }
        if (normalizedUser.length < 3) {
            setError("⚠ Nazwa użytkownika musi mieć co najmniej 3 znaki");
            return;
        }

        setSaving(true);
        setError("");

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("Brak dostępu do profilu");
            setSaving(false);
            setProfileEditing(false);
            return;
        }

        let avatarUrl = avatar;

        if (avatarFile) {

            const filePath = `${user.id}/avatar.jpg`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, avatarFile, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: avatarFile.type,
                });

            if (uploadError) {
                console.error(uploadError);
                setError("⚠ Nie udało się przesłać awatara");
                setSaving(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
            avatarUrl = `${publicUrl}?v=${Date.now()}`;
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ username: normalizedUser, avatar: avatarUrl })
            .eq("id", user.id);

        if (updateError) {
            console.error(updateError);
            if (updateError.code === "23505") {
                setError("⚠ Nazwa użytkownika jest zajęta");
            } else {
                setError("⚠ Nie udało się zaktualizować profilu");
            }
            setSaving(false);
            return;
        }

        setUsername(normalizedUser)
        setAvatar(avatarUrl);
        setAvatarDraft(avatarUrl);
        setAvatarFile(null);
        setProfileEditing(false);
        setSaving(false);
    }

    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const initials = username ? username.slice(0, 2).toUpperCase() : "?";

    const displayedAvatar = profileEditing
        ? avatarDraft
        : avatar;

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="vhs-badge text-neon-pink">
                    ŁADOWANIE PROFILU...
                </div>
            </div>
        );
    }

    return (
        <div className="x-auto container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-8 py-8 pb-22 sm:pb-8">
            <div>
                <div className="font-['Russo_One'] text-[20px] tracking-[0.04em] uppercase text-white">
                    Twój{" "}
                    <span className="text-neon-pink [text-shadow:0_0_12px_#ff2d78]">
                        profil
                    </span>
                </div>

                <div className="vhs-badge mt-1 text-text-light">
                    Twoja tożsamość — edytuj imię oraz avatara.
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-sm border-2 border-neon-pink/10 bg-[#0e0e1a] p-6 shadow-[0_0_24px_#ff2d7810]">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-sm border-2 border-neon-pink bg-gradient-to-br from-[#1a0a2e] to-[#2a0a1e] shadow-[0_0_20px_#ff2d7840]">
                    {displayedAvatar ? (
                        <Image
                            src={displayedAvatar}
                            alt="Avatar"
                            width={100}
                            height={100}
                            className="h-full w-full rounded-sm object-cover" />
                    ) : (
                        <span className="font-russo text-[28px] text-neon-pink">
                            {initials}
                        </span>
                    )} {profileEditing && (
                        <>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-3 z-10 cursor-pointer rounded-full border border-neon-pink bg-gradient-to-br from-[#1a0a2e] to-[#2a0a1e] p-1.5 text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-colors hover:bg-neon-pink hover:text-white" aria-label="Zmień avatar" >
                                <Pencil size={16} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
                        </>)}
                </div>

                {error && (
                    <div className="vhs-badge text-center text-neon-pink"> {error} </div>
                )}


                {profileEditing ? (
                    <div className="flex w-full max-w-md flex-col items-center sm:max-w-xs gap-2">
                        <input
                            value={usernameDraft}
                            onChange={(e) => setUsernameDraft(e.target.value)}
                            placeholder="Twoje imię"
                            autoFocus
                            className="flex-1 rounded-sm border border-neon-pink/30 bg-[#080810] px-3 py-2 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    saveProfile();
                                }

                                if (e.key === "Escape") {
                                    cancelEditing();
                                }
                            }}
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={saveProfile}
                                className="vhs-badge cursor-pointer rounded-sm border-2 hover:scale-[1.02] transition-all border-neon-pink bg-neon-pink/10 uppercase px-3 py-1 text-neon-pink"
                            >
                                {saving ? "Zapisywanie..." : "Zapisz"}
                            </button>
                            <button
                                onClick={cancelEditing}
                                className="vhs-badge cursor-pointer rounded-sm border border-border hover:border-[#ff2d7840] hover:text-neon-pink uppercase px-2 py-1 text-text-light"
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="font-russo text-[18px] tracking-[0.04em] text-[#e8e0ff]">
                            {username || "Niezalogowany"}
                        </div>

                        <button
                            onClick={startEditing}
                            className="vhs-badge cursor-pointer rounded-sm border border-border hover:border-[#ff2d7840] hover:text-neon-pink uppercase px-2 py-1 text-text-light"
                        >
                            Edytuj
                        </button>
                    </div>
                )}
            </div>
            <button onClick={logout} className="w-full cursor-pointer rounded-sm border border-[#ff2d7840] bg-transparent py-3.5 font-russo text-[13px] tracking-[0.08em] text-text-light transition-all duration-200 hover:border-neon-pink hover:text-neon-pink uppercase">⏏ Wyloguj się</button>
        </div>
    );
}
export default ProfilePage    