/* ===== Supabase Database Types ===== */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    ticker: string;
                    sector: string;
                    market_list: string;
                    description: string;
                    logo_url: string | null;
                    website_url: string | null;
                    rss_feed_url: string | null;
                    is_fairvalue_customer: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    ticker: string;
                    sector?: string;
                    market_list?: string;
                    description?: string;
                    logo_url?: string | null;
                    website_url?: string | null;
                    rss_feed_url?: string | null;
                    is_fairvalue_customer?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    ticker?: string;
                    sector?: string;
                    market_list?: string;
                    description?: string;
                    logo_url?: string | null;
                    website_url?: string | null;
                    rss_feed_url?: string | null;
                    is_fairvalue_customer?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            press_releases: {
                Row: {
                    id: string;
                    company_id: string;
                    title: string;
                    content: string | null;
                    source_url: string;
                    published_at: string;
                    category: string | null;
                    ai_summary: string | null;
                    key_takeaways: Json | null;
                    sentiment_score: number | null;
                    triggers: Json | null;      // [{ type, description, confidence, impact }]
                    kpis: Json | null;           // [{ name, value, unit, period, yoy_change }]
                    processed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    title: string;
                    content?: string | null;
                    source_url?: string;
                    published_at?: string;
                    category?: string | null;
                    ai_summary?: string | null;
                    key_takeaways?: Json | null;
                    sentiment_score?: number | null;
                    triggers?: Json | null;
                    kpis?: Json | null;
                    processed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    title?: string;
                    content?: string | null;
                    source_url?: string;
                    published_at?: string;
                    category?: string | null;
                    ai_summary?: string | null;
                    key_takeaways?: Json | null;
                    sentiment_score?: number | null;
                    triggers?: Json | null;
                    kpis?: Json | null;
                    processed_at?: string | null;
                    created_at?: string;
                };
            };
            user_follows: {
                Row: {
                    id: string;
                    user_id: string;
                    company_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    company_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    company_id?: string;
                    created_at?: string;
                };
            };
            ai_summaries: {
                Row: {
                    id: string;
                    company_id: string;
                    summary_type: string;
                    content: string;
                    generated_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    summary_type?: string;
                    content: string;
                    generated_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    summary_type?: string;
                    content?: string;
                    generated_at?: string;
                };
            };
            agent_jobs: {
                Row: {
                    id: string;
                    agent_type: "press_release" | "trigger" | "kpi";
                    status: "pending" | "running" | "done" | "failed";
                    payload: Json;
                    result: Json | null;
                    error: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    agent_type: "press_release" | "trigger" | "kpi";
                    status?: "pending" | "running" | "done" | "failed";
                    payload?: Json;
                    result?: Json | null;
                    error?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    status?: "pending" | "running" | "done" | "failed";
                    result?: Json | null;
                    error?: string | null;
                    updated_at?: string;
                };
            };
        };
    };
}

/* ===== Helper types ===== */
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
