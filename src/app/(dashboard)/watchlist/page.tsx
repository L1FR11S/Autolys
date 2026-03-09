"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";

type Company = Tables<"companies">;
interface FollowedCompany extends Company { latestPR?: { title: string; published_at: string } }

export default function WatchlistPage() {
    const [companies, setCompanies] = useState<FollowedCompany[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }
            const { data: follows } = await supabase.from("user_follows").select("company_id").eq("user_id", user.id);
            if (!follows?.length) { setLoading(false); return; }
            const { data: comps } = await supabase.from("companies").select("*").in("id", follows.map((f) => f.company_id)).order("name");
            if (!comps) { setLoading(false); return; }
            const results: FollowedCompany[] = await Promise.all(
                comps.map(async (c) => {
                    const { data: pr } = await supabase.from("press_releases").select("title, published_at").eq("company_id", c.id).order("published_at", { ascending: false }).limit(1).maybeSingle();
                    return { ...c, latestPR: pr || undefined };
                })
            );
            setCompanies(results);
            setLoading(false);
        }
        load();
    }, []);

    async function handleUnfollow(companyId: string) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("user_follows").delete().eq("user_id", user.id).eq("company_id", companyId);
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    }

    if (loading) return (
        <div style={{ maxWidth: "720px", margin: "0 auto", paddingTop: "12px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>Bevakningslista</h1>
            <div className="card-section" style={{ padding: "20px" }}>
                {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: "48px", marginBottom: "8px" }} />)}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "720px", margin: "0 auto", paddingTop: "12px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Bevakningslista</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>{companies.length} bolag i din bevakning</p>
            {companies.length === 0 ? (
                <div className="card-section" style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>Du följer inga bolag ännu</p>
                    <Link href="/explore" className="btn-primary">Utforska bolag</Link>
                </div>
            ) : (
                <div className="card-section">
                    {companies.map((company, index) => {
                        const daysSince = company.latestPR ? Math.floor((Date.now() - new Date(company.latestPR.published_at).getTime()) / 86400000) : null;
                        return (
                            <Link key={company.id} href={`/company/${company.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="feed-row animate-in" style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}>
                                    <div className="company-logo">{company.ticker.slice(0, 2)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1px" }}>
                                            <span style={{ fontWeight: 700, fontSize: "14px" }}>{company.name}</span>
                                            <span className="mono" style={{ color: "var(--text-muted)" }}>{company.ticker}</span>
                                        </div>
                                        {company.latestPR && <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.latestPR.title}</div>}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                        {daysSince !== null && daysSince <= 7 && <span className="badge badge-positive">Nytt</span>}
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                            {daysSince !== null ? (daysSince === 0 ? "Idag" : daysSince === 1 ? "Igår" : `${daysSince}d sedan`) : ""}
                                        </span>
                                    </div>
                                    <button className="heart-btn active" onClick={(e) => { e.preventDefault(); handleUnfollow(company.id); }}>❤</button>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
            <div style={{ textAlign: "center", padding: "24px" }}>
                <Link href="/explore" className="btn-secondary">+ Lägg till bolag</Link>
            </div>
        </div>
    );
}
