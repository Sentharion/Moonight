import type { SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "../../constant";

/**
 * Ensures that a user profile exists in `public.users` table for the given Supabase auth user.
 * If missing or username is blank, inserts/upserts a profile record using auth metadata or email.
 */
export async function ensureUserProfile(
    supabase: SupabaseClient,
    authUser: SupabaseAuthUser | { id: string; user_metadata?: { username?: string; avatar?: string }; email?: string } | null
): Promise<User | null> {
    if (!authUser || !authUser.id) return null;

    // 1. Check if user profile already exists with a username
    const { data: existing } = await supabase
        .from("users")
        .select("id, username, avatar, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

    if (existing && existing.username && existing.username !== "Gospodarz") {
        return existing as User;
    }

    // 2. Extract username from metadata or email
    const metaUsername = authUser.user_metadata?.username;
    const fallbackUsername = authUser.email ? authUser.email.split("@")[0] : "Użytkownik";
    const username = metaUsername && metaUsername.trim().length > 0 ? metaUsername.trim() : fallbackUsername;
    const avatar = authUser.user_metadata?.avatar || null;

    // 3. Upsert into public.users table
    const { data: upserted, error } = await supabase
        .from("users")
        .upsert(
            {
                id: authUser.id,
                username: username,
                avatar: avatar,
            },
            { onConflict: "id" }
        )
        .select()
        .single();

    if (error) {
        console.error("ensureUserProfile upsert error:", error);
        return null;
    }

    return upserted as User;
}
