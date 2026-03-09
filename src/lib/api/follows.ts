import { createClient } from "@/lib/supabase";

/* ===== Get user's followed company IDs ===== */
export async function getUserFollows(userId: string): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("user_follows")
        .select("company_id")
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching follows:", error);
        return [];
    }
    return (data ?? []).map((f) => f.company_id);
}

/* ===== Check if user follows a company ===== */
export async function isFollowing(userId: string, companyId: string): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .maybeSingle();

    if (error) return false;
    return !!data;
}

/* ===== Follow a company ===== */
export async function followCompany(userId: string, companyId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("user_follows")
        .insert({ user_id: userId, company_id: companyId });

    if (error) {
        console.error("Error following company:", error);
        return false;
    }
    return true;
}

/* ===== Unfollow a company ===== */
export async function unfollowCompany(userId: string, companyId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("user_id", userId)
        .eq("company_id", companyId);

    if (error) {
        console.error("Error unfollowing company:", error);
        return false;
    }
    return true;
}

/* ===== Toggle follow (convenience) ===== */
export async function toggleFollow(userId: string, companyId: string): Promise<{ following: boolean }> {
    const following = await isFollowing(userId, companyId);
    if (following) {
        await unfollowCompany(userId, companyId);
        return { following: false };
    } else {
        await followCompany(userId, companyId);
        return { following: true };
    }
}
