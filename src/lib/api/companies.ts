import { createServerClient } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";

export type Company = Tables<"companies">;

/* ===== Get all companies ===== */
export async function getCompanies(): Promise<Company[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching companies:", error);
        return [];
    }
    return data ?? [];
}

/* ===== Get company by slug ===== */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("Error fetching company:", error);
        return null;
    }
    return data;
}

/* ===== Search companies ===== */
export async function searchCompanies(query: string): Promise<Company[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .or(`name.ilike.%${query}%,ticker.ilike.%${query}%`)
        .order("name")
        .limit(20);

    if (error) {
        console.error("Error searching companies:", error);
        return [];
    }
    return data ?? [];
}

/* ===== Get companies by sector ===== */
export async function getCompaniesBySector(sector: string): Promise<Company[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("sector", sector)
        .order("name");

    if (error) {
        console.error("Error fetching companies by sector:", error);
        return [];
    }
    return data ?? [];
}

/* ===== Get Fairvalue customer companies ===== */
export async function getFairvalueCompanies(): Promise<Company[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("is_fairvalue_customer", true)
        .order("name");

    if (error) {
        console.error("Error fetching Fairvalue companies:", error);
        return [];
    }
    return data ?? [];
}

/* ===== Get unique sectors ===== */
export async function getSectors(): Promise<string[]> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("companies")
        .select("sector")
        .order("sector");

    if (error) return [];
    const unique = [...new Set((data ?? []).map((d) => d.sector))];
    return unique;
}
