import { createServerClient } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";

export type PressRelease = Tables<"press_releases">;

export interface PressReleaseWithCompany extends PressRelease {
    companies: {
        id: string;
        name: string;
        slug: string;
        ticker: string;
        sector: string;
        market_list: string;
        is_fairvalue_customer: boolean;
    };
}

/* ===== Get press releases by company ===== */
export async function getPressReleasesByCompany(companyId: string): Promise<PressRelease[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("press_releases")
        .select("*")
        .eq("company_id", companyId)
        .order("published_at", { ascending: false });

    if (error) {
        console.error("Error fetching press releases:", error);
        return [];
    }
    return data ?? [];
}

/* ===== Get latest press releases (all companies) ===== */
export async function getLatestPressReleases(limit = 20): Promise<PressReleaseWithCompany[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("press_releases")
        .select(`
      *,
      companies (
        id, name, slug, ticker, sector, market_list, is_fairvalue_customer
      )
    `)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching latest press releases:", error);
        return [];
    }
    return (data as unknown as PressReleaseWithCompany[]) ?? [];
}

/* ===== Get feed press releases (for followed companies) ===== */
export async function getFeedPressReleases(companyIds: string[], limit = 30): Promise<PressReleaseWithCompany[]> {
    if (companyIds.length === 0) return [];

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("press_releases")
        .select(`
      *,
      companies (
        id, name, slug, ticker, sector, market_list, is_fairvalue_customer
      )
    `)
        .in("company_id", companyIds)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching feed press releases:", error);
        return [];
    }
    return (data as unknown as PressReleaseWithCompany[]) ?? [];
}

/* ===== Get latest press release for a company ===== */
export async function getLatestPressRelease(companyId: string): Promise<PressRelease | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("press_releases")
        .select("*")
        .eq("company_id", companyId)
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data;
}
