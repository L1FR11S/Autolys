"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getSentimentFromScore } from "@/types";
import type { Tables } from "@/types/database.types";
import StockChart from "@/components/StockChart";

// Utöka Companies-typen tills Supabase-typen är regenererad efter migration
type Company = Tables<"companies"> & { yahoo_ticker?: string | null };
type PressRelease = Tables<"press_releases">;
type Section = "description" | "stock" | "snapshot" | "triggers" | "geography" | "management" | "similar" | "calendar" | "analysis" | "kpi";

const sidebarSections: { key: Section; label: string }[] = [
    { key: "description", label: "Beskrivning" },
    { key: "stock", label: "Aktiekurs" },
    { key: "snapshot", label: "Snapshot" },
    { key: "triggers", label: "Triggers" },
    { key: "geography", label: "Geografisk exponering" },
    { key: "management", label: "Ledningens kommentarer" },
    { key: "similar", label: "Liknande bolag" },
    { key: "calendar", label: "Kalender" },
    { key: "analysis", label: "Analyser" },
    { key: "kpi", label: "Nyckeltal" },
];

/* ===== Section icons (SVG inline) ===== */
const SectionIcons: Record<Section, React.ReactElement> = {
    description: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    stock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    snapshot: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    triggers: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    geography: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    management: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    similar: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    calendar: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    analysis: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    kpi: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>,
};

/* ===== Coming Soon placeholder ===== */
function ComingSoon({ text = "Data tillgänglig snart" }: { text?: string }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "40px 24px", gap: "8px", textAlign: "center",
        }}>
            <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--brand-dim)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--brand)", marginBottom: "2px",
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{text}</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "260px", lineHeight: 1.55 }}>
                Vi jobbar på att hämta och analysera denna data automatiskt.
            </p>
        </div>
    );
}

/* ===== Section Label ===== */
function SLabel({ sectionKey, children }: { sectionKey: Section; children: string }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px",
        }}>
            <span style={{ color: "var(--brand)", opacity: 0.8 }}>{SectionIcons[sectionKey]}</span>
            {children}
        </div>
    );
}

export default function CompanyPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [activeSection, setActiveSection] = useState<Section>("description");
    const [company, setCompany] = useState<Company | null>(null);
    const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [calendarTab, setCalendarTab] = useState(0);
    const [selectedPR, setSelectedPR] = useState<PressRelease | null>(null);

    useEffect(() => {
        const supabase = createClient();
        async function loadData() {
            const { data: comp } = await supabase.from("companies").select("*").eq("slug", slug).single();
            if (!comp) { setLoading(false); return; }
            setCompany(comp);
            const { data: prs } = await supabase.from("press_releases").select("*").eq("company_id", comp.id).order("published_at", { ascending: false });
            setPressReleases(prs ?? []);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data: follow } = await supabase.from("user_follows").select("id").eq("user_id", user.id).eq("company_id", comp.id).maybeSingle();
                setIsFollowing(!!follow);
            }
            setLoading(false);
        }
        loadData();
    }, [slug]);

    // Uppdatera aktiv sidebar-sektion vid scroll
    useEffect(() => {
        if (loading) return;
        const sectionKeys = sidebarSections.map((s) => s.key);
        const observers: IntersectionObserver[] = [];
        sectionKeys.forEach((key) => {
            const el = document.getElementById(`section-${key}`);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(key); },
                { rootMargin: "-56px 0px -60% 0px", threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [loading]);

    async function handleToggleFollow() {
        if (!company || !userId) return;
        const supabase = createClient();
        if (isFollowing) {
            await supabase.from("user_follows").delete().eq("user_id", userId).eq("company_id", company.id);
            setIsFollowing(false);
        } else {
            await supabase.from("user_follows").insert({ user_id: userId, company_id: company.id });
            setIsFollowing(true);
        }
    }

    function scrollToSection(key: Section) {
        const el = document.getElementById(`section-${key}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (loading) return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", paddingTop: "24px" }}>
            <div className="skeleton" style={{ width: "220px", height: "28px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ width: "100%", height: "220px" }} />
        </div>
    );

    if (!company) return (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Bolaget hittades inte</h1>
            <Link href="/explore" className="btn-primary">← Utforska bolag</Link>
        </div>
    );

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", paddingTop: "16px" }}>

            {/* ===== Company Header ===== */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
                {/* Logo – rundad kvadrat, Quanor-stil */}
                <div style={{
                    width: "56px", height: "56px", borderRadius: "10px", flexShrink: 0,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "16px", color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                }}>
                    {company.ticker.slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>{company.name}</h1>
                        <span className="badge badge-brand" style={{ fontSize: "11px" }}>{company.ticker}</span>
                        <span className="badge badge-neutral" style={{ fontSize: "11px" }}>{company.market_list}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "3px" }}>{company.sector}</p>
                </div>

                {/* Följ-knapp – hjärtikon som Quanor */}
                <button
                    onClick={handleToggleFollow}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 16px", borderRadius: "var(--radius-pill)",
                        fontSize: "13px", fontWeight: 500, cursor: "pointer",
                        fontFamily: "inherit", transition: "all var(--transition)",
                        background: isFollowing ? "var(--brand-dim)" : "transparent",
                        border: `1px solid ${isFollowing ? "var(--brand)" : "var(--border)"}`,
                        color: isFollowing ? "var(--brand)" : "var(--text-secondary)",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFollowing ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {isFollowing ? "Följer" : "Följ ej"}
                </button>

                {company.website_url && (
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: "13px" }}>
                        ↗ Webbplats
                    </a>
                )}
            </div>

            {/* ===== Sidebar + Content ===== */}
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "28px" }}>

                {/* Sidebar */}
                <nav className="desktop-only" style={{ position: "sticky", top: "68px", alignSelf: "start" }}>
                    {sidebarSections.map((s) => {
                        const isActive = activeSection === s.key;
                        return (
                            <button
                                key={s.key}
                                onClick={() => scrollToSection(s.key)}
                                style={{
                                    display: "block", width: "100%", textAlign: "left",
                                    padding: "8px 12px", fontSize: "13px", fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "var(--brand)" : "var(--text-secondary)",
                                    background: isActive ? "var(--brand-dim)" : "transparent",
                                    border: "none", borderRadius: "var(--radius-md)",
                                    cursor: "pointer", transition: "all var(--transition)",
                                    marginBottom: "1px", fontFamily: "inherit",
                                }}
                            >
                                {s.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Main Content */}
                <div style={{ minWidth: 0 }}>

                    {/* 1. Beskrivning + Aktiekurs */}
                    <div id="section-description" style={{ scrollMarginTop: "76px", marginBottom: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
                            <div className="card-section" style={{ padding: "22px" }}>
                                <SLabel sectionKey="description">FÖRETAGSBESKRIVNING</SLabel>
                                {company.description ? (
                                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75 }}>{company.description}</p>
                                ) : (
                                    <ComingSoon text="Beskrivning saknas" />
                                )}
                            </div>
                            <div id="section-stock" className="card-section" style={{ padding: "22px", scrollMarginTop: "76px" }}>
                                <SLabel sectionKey="stock">AKTIEKURS</SLabel>
                                {company.yahoo_ticker ? (
                                    <StockChart ticker={company.yahoo_ticker} />
                                ) : (
                                    <ComingSoon text="Kursdata hämtas snart" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Snapshot */}
                    <div id="section-snapshot" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="snapshot">SNAPSHOT</SLabel>
                        {pressReleases.length > 0 ? (
                            <div>
                                {pressReleases.map((pr, i) => {
                                    const sentiment = getSentimentFromScore(pr.sentiment_score);
                                    const takeaways = pr.key_takeaways as string[] | null;
                                    return (
                                        <div key={pr.id} className="snapshot-item animate-in" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                                            <div className={`snapshot-dot ${sentiment === "cautious" ? "snapshot-dot-cautious" : sentiment === "negative" ? "snapshot-dot-negative" : sentiment === "neutral" ? "snapshot-dot-neutral" : ""}`} />
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px" }}>
                                                {new Date(pr.published_at).toLocaleDateString("sv-SE")}
                                            </div>
                                            <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.4, marginBottom: "8px" }}>{pr.title}</h3>
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "10px" }}>{pr.ai_summary || "Sammanfattning genereras..."}</p>
                                            {takeaways && takeaways.length > 0 && (
                                                <ul style={{ listStyle: "none", marginBottom: "10px" }}>
                                                    {takeaways.map((t, j) => (
                                                        <li key={j} style={{ fontSize: "13px", color: "var(--text-secondary)", paddingLeft: "14px", position: "relative", marginBottom: "2px" }}>
                                                            <span style={{ position: "absolute", left: 0, color: "var(--brand)", fontWeight: 700 }}>›</span>{t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <ComingSoon text="Inga pressmeddelanden ännu" />
                        )}
                    </div>

                    {/* 3. Triggers – POSITIVA / NEGATIVA (Quanor-stil) */}
                    <div id="section-triggers" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="triggers">TRIGGERS</SLabel>
                        {(() => {
                            const positiva: string[] = [];
                            const negativa: string[] = [];
                            for (const pr of pressReleases) {
                                const t = (pr as any).triggers;
                                if (t && typeof t === "object" && !Array.isArray(t)) {
                                    if (Array.isArray(t.positiva)) positiva.push(...t.positiva);
                                    if (Array.isArray(t.negativa)) negativa.push(...t.negativa);
                                }
                            }
                            if (positiva.length === 0 && negativa.length === 0) {
                                return <ComingSoon text="Triggers analyseras från pressmeddelanden" />;
                            }
                            return (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "8px" }}>
                                    <div>
                                        <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "12px" }}>POSITIVA</h4>
                                        {positiva.slice(0, 5).map((p, i) => (
                                            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "flex-start" }}>
                                                <span style={{ color: "var(--positive)", fontWeight: 700, fontSize: "14px", marginTop: "1px" }}>+</span>
                                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{p}</p>
                                            </div>
                                        ))}
                                        {positiva.length === 0 && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Inga positiva triggers identifierade</p>}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "12px" }}>NEGATIVA</h4>
                                        {negativa.slice(0, 5).map((n, i) => (
                                            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "flex-start" }}>
                                                <span style={{ color: "var(--negative)", fontWeight: 700, fontSize: "14px", marginTop: "1px" }}>–</span>
                                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{n}</p>
                                            </div>
                                        ))}
                                        {negativa.length === 0 && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Inga negativa triggers identifierade</p>}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 4. Geografisk exponering */}
                    <div id="section-geography" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="geography">GEOGRAFISK EXPONERING</SLabel>
                        {(() => {
                            const geoRaw = (company as any).geographic_exposure;
                            const geo = Array.isArray(geoRaw) ? geoRaw : (geoRaw?.regions || null);
                            if (!geo || !Array.isArray(geo) || geo.length === 0) {
                                return <ComingSoon text="Geografisk analys genereras av AI" />;
                            }
                            const levelColor = (l: string) => l === "high" ? "var(--positive)" : l === "low" ? "var(--text-muted)" : "var(--brand)";
                            const levelLabel = (l: string) => l === "high" ? "High" : l === "low" ? "Low" : "Med";
                            return (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                                    {geo.map((g, i) => (
                                        <div key={i} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "16px", border: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                                <span style={{ fontSize: "15px", fontWeight: 700 }}>{g.country}</span>
                                                <span style={{
                                                    fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                                                    background: `${levelColor(g.level)}15`, color: levelColor(g.level), border: `1px solid ${levelColor(g.level)}30`
                                                }}>{levelLabel(g.level)}</span>
                                            </div>
                                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px", fontWeight: 600 }}>Nyckelsegment / kunder</p>
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "10px" }}>{g.segments}</p>
                                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px", fontWeight: 600 }}>Primära risker eller katalysatorer</p>
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{g.risks}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* 5. Ledningens kommentarer */}
                    <div id="section-management" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="management">LEDNINGENS KOMMENTARER</SLabel>
                        {(() => {
                            const commentsRaw = (company as any).management_comments;
                            const comments = Array.isArray(commentsRaw) ? commentsRaw : (commentsRaw?.quotes || null);
                            if (!comments || !Array.isArray(comments) || comments.length === 0) {
                                return <ComingSoon text="Ledningscitat extraheras från rapporter" />;
                            }
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
                                    {comments.map((c, i) => (
                                        <div key={i} style={{ borderLeft: "3px solid var(--brand)", paddingLeft: "16px" }}>
                                            <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 8px 0" }}>
                                                &ldquo;{c.quote}&rdquo;
                                            </p>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{c.person}</span>
                                                {c.title && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>– {c.title}</span>}
                                            </div>
                                            {c.context && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.4 }}>{c.context}</p>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* 6. Liknande bolag */}
                    <div id="section-similar" style={{ scrollMarginTop: "76px", marginBottom: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div className="card-section" style={{ padding: "22px" }}>
                                <SLabel sectionKey="similar">LIKNANDE BOLAG</SLabel>
                                {(() => {
                                    const similarRaw = (company as any).similar_companies;
                                    const similar = Array.isArray(similarRaw) ? similarRaw : (similarRaw?.companies || null);
                                    if (!similar || !Array.isArray(similar) || similar.length === 0) return <ComingSoon text="Liknande bolag beräknas snart" />;
                                    return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                            {similar.map((s: any, i: number) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < similar.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius)", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--brand)" }}>
                                                            {s.name?.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: "14px", fontWeight: 500 }}>{s.name}</span>
                                                    </div>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* 7. Kalender */}
                            <div id="section-calendar" className="card-section" style={{ padding: "22px", scrollMarginTop: "76px" }}>
                                <SLabel sectionKey="calendar">KALENDER</SLabel>
                                <div style={{ display: "flex", gap: "0", marginBottom: "12px" }}>
                                    <button onClick={() => setCalendarTab(0)} style={{ padding: "4px 12px", fontSize: "12px", fontWeight: calendarTab === 0 ? 600 : 400, background: calendarTab === 0 ? "var(--bg-elevated)" : "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius) 0 0 var(--radius)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "inherit" }}>{company.name}</button>
                                    <button onClick={() => setCalendarTab(1)} style={{ padding: "4px 12px", fontSize: "12px", fontWeight: calendarTab === 1 ? 600 : 400, background: calendarTab === 1 ? "var(--bg-elevated)" : "transparent", border: "1px solid var(--border)", borderLeft: "none", borderRadius: "0 var(--radius) var(--radius) 0", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "inherit" }}>Jämförbara bolag</button>
                                </div>
                                {(() => {
                                    const reportsRaw = (company as any).upcoming_reports;
                                    const reports = Array.isArray(reportsRaw) ? reportsRaw : (reportsRaw?.events || null);
                                    if (!reports || reports.length === 0) return <ComingSoon text="Rapportdatum tillgängliga snart" />;
                                    return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                            {reports.map((r: any, i: number) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: i < reports.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "110px" }}>⏱ {r.date}</span>
                                                    <div>
                                                        <span style={{ fontSize: "13px", fontWeight: 500 }}>{r.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* 8. Analyser – tabell med klickbar modal */}
                    <div id="section-analysis" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="analysis">ANALYSER</SLabel>
                        {pressReleases.length === 0 ? (
                            <ComingSoon text="Analyser tillgängliga snart" />
                        ) : (
                            <>
                                {/* Filter badges */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                                    {["Financial Reports", "Press Releases", "Price Triggers", "Regulatoriskt"].map(f => (
                                        <span key={f} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "99px", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", background: "var(--bg-elevated)" }}>{f}</span>
                                    ))}
                                </div>
                                {/* Tabell-header */}
                                <div style={{ display: "grid", gridTemplateColumns: "120px 120px 1fr 50px", gap: "8px", padding: "6px 0", borderBottom: "1px solid var(--border)", marginBottom: "2px" }}>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>⏱ Publicerad</span>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>💡 Analyserad</span>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}></span>
                                    <span></span>
                                </div>
                                {/* Rader */}
                                {pressReleases.slice(0, 15).map((pr) => {
                                    const cat = pr.category ?? "PR";
                                    const pubDate = new Date(pr.published_at);
                                    const analyzedAt = (pr as any).analyzed_at ? new Date((pr as any).analyzed_at) : null;
                                    return (
                                        <div key={pr.id}
                                            onClick={() => setSelectedPR(pr)}
                                            style={{
                                                display: "grid", gridTemplateColumns: "120px 120px 1fr 50px", gap: "8px",
                                                padding: "10px 0", borderBottom: "1px solid var(--border)",
                                                cursor: "pointer", alignItems: "center",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {pubDate.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}, {pubDate.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {analyzedAt ? `${analyzedAt.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}, ${analyzedAt.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}` : "–"}
                                            </span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                {company.logo_url && <img src={company.logo_url} alt="" style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "contain" }} />}
                                                <div>
                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{company.name}</span>
                                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.3 }}>{pr.title.slice(0, 80)}{pr.title.length > 80 ? "…" : ""}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--brand)", background: "var(--brand-dim)", padding: "2px 6px", borderRadius: "99px", textAlign: "center" }}>
                                                {cat === "Rapport" ? "FR" : cat === "Regulatorisk" ? "REG" : "PR"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    {/* Analys-modal */}
                    {selectedPR && (
                        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                            onClick={() => setSelectedPR(null)}>
                            <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", maxWidth: "680px", width: "100%", maxHeight: "80vh", overflow: "auto", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
                                onClick={e => e.stopPropagation()}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <div>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(selectedPR.published_at).toLocaleDateString("sv-SE")} · {company.name}</span>
                                        <h3 style={{ fontSize: "17px", fontWeight: 700, marginTop: "4px", lineHeight: 1.4, color: "var(--text-primary)" }}>{selectedPR.title}</h3>
                                        {(selectedPR as any).relevance && (
                                            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px", background: (selectedPR as any).relevance === "hög" ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)", color: (selectedPR as any).relevance === "hög" ? "#ef4444" : "var(--text-muted)", marginTop: "6px", display: "inline-block" }}>
                                                {(selectedPR as any).relevance === "hög" ? "Hög relevans" : (selectedPR as any).relevance === "låg" ? "Låg relevans" : "Medel relevans"}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => setSelectedPR(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px", padding: "4px" }}>✕</button>
                                </div>

                                {/* TAKEAWAYS */}
                                {(() => {
                                    const takeaways = (selectedPR as any).takeaways as any[] | null;
                                    if (!takeaways || takeaways.length === 0) return null;
                                    return (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "10px" }}>TAKEAWAYS</h4>
                                            {takeaways.map((t: any, i: number) => (
                                                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                                                    <span style={{ color: t.type === "positiv" ? "var(--positive)" : t.type === "negativ" ? "var(--negative)" : "var(--text-muted)", fontWeight: 700, fontSize: "13px", marginTop: "1px" }}>
                                                        {t.type === "positiv" ? "+" : t.type === "negativ" ? "–" : "•"}
                                                    </span>
                                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{t.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* DATAPUNKTER */}
                                {(() => {
                                    const datapunkter = (selectedPR as any).datapunkter as any[] | null;
                                    if (!datapunkter || datapunkter.length === 0) return null;
                                    return (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "10px" }}>DATAPUNKTER</h4>
                                            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                                                {datapunkter.map((d: any, i: number) => (
                                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: i < datapunkter.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "var(--bg-elevated)" : "transparent" }}>
                                                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{d.label}</span>
                                                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Källtext */}
                                {selectedPR.ai_summary && (
                                    <div style={{ marginBottom: "16px" }}>
                                        <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>SAMMANFATTNING</h4>
                                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{selectedPR.ai_summary}</p>
                                    </div>
                                )}

                                <a href={selectedPR.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--brand)", textDecoration: "none" }}>
                                    Öppna original →
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 9. Nyckeltal */}
                    <div id="section-kpi" className="card-section" style={{ padding: "22px", marginBottom: "16px", scrollMarginTop: "76px" }}>
                        <SLabel sectionKey="kpi">NYCKELTAL</SLabel>
                        {(() => {
                            // Samla KPI:er från pressreleaser som har dem
                            const allKpis: { name: string; value: number; unit: string; period: string | null; yoy_change: number | null }[] = [];
                            for (const pr of pressReleases) {
                                const kpis = (pr as any).kpis;
                                if (Array.isArray(kpis)) allKpis.push(...kpis);
                            }
                            if (allKpis.length === 0) return <ComingSoon text="Nyckeltal extraheras från rapporter" />;

                            // Gruppera per namn
                            const grouped = new Map<string, typeof allKpis>();
                            for (const k of allKpis) {
                                const key = k.name;
                                if (!grouped.has(key)) grouped.set(key, []);
                                grouped.get(key)!.push(k);
                            }

                            // Hitta unika perioder
                            const periods = [...new Set(allKpis.map(k => k.period).filter(Boolean))].slice(0, 6) as string[];

                            return (
                                <div style={{ overflowX: "auto", marginTop: "8px" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid var(--border)" }}>
                                                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)", fontSize: "11px" }}></th>
                                                {periods.map(p => (
                                                    <th key={p} style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)", fontSize: "11px" }}>{p}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...grouped.entries()].map(([name, values]) => (
                                                <tr key={name} style={{ borderBottom: "1px solid var(--border)" }}>
                                                    <td style={{ padding: "8px 12px", fontWeight: 500, color: "var(--text-secondary)" }}>{name}</td>
                                                    {periods.map(p => {
                                                        const match = values.find(v => v.period === p);
                                                        return (
                                                            <td key={p} style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-primary)" }}>
                                                                {match ? (
                                                                    <div>
                                                                        <span style={{ fontWeight: 600 }}>{match.value} {match.unit}</span>
                                                                        {match.yoy_change != null && (
                                                                            <div style={{ fontSize: "11px", color: match.yoy_change >= 0 ? "var(--positive)" : "var(--negative)" }}>
                                                                                {match.yoy_change >= 0 ? "+" : ""}{match.yoy_change}%
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : "–"}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Friskrivning */}
                    <div style={{ padding: "20px 0", borderTop: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.6 }}>
                            <strong>Friskrivning</strong> Informationen på denna sida genereras automatiskt av Autolys AI-system och är
                            endast avsedd för informationsändamål. Innehållet utgör inte finansiell rådgivning, investeringsrekommendation eller
                            uppmaning att köpa eller sälja värdepapper. Historisk utveckling är ingen garanti för framtida resultat.
                            Du ansvarar själv för dina investeringsbeslut.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
