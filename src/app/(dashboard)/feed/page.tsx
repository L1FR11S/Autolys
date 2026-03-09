import Link from "next/link";
import { getLatestPressReleases } from "@/lib/api/press-releases";

export default async function FeedPage() {
    const allItems = await getLatestPressReleases(20);

    return (
        <div className="dashboard-grid" style={{ maxWidth: "1300px", margin: "0 auto", display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: "20px", paddingTop: "12px" }}>

            {/* ===== LEFT COLUMN ===== */}
            <aside className="desktop-only">
                {/* Macro News */}
                <div className="card-section" style={{ marginBottom: "16px" }}>
                    <div style={{ padding: "16px 16px 0" }}>
                        <div className="section-label">MAKRONYHETER</div>
                    </div>
                    <div style={{ padding: "12px 16px 16px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.35, marginBottom: "8px" }}>
                            Konflikten i Mellanöstern stör energi- och global stabilitet
                        </h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "12px" }}>
                            Angrepp mot kritisk infrastruktur, inklusive avvsaltningsanläggningar i Iran och Bahrain samt attacker mot oljeledpar...
                        </p>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>6 Källor <span style={{ opacity: 0.5 }}>●●●</span></div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: "11px" }}>‹</button>
                            <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: "11px" }}>⋮⋮</button>
                            <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: "11px" }}>›</button>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="card-section">
                    <div className="tab-nav" style={{ padding: "0 16px" }}>
                        <button className="tab-item active">KALENDER</button>
                        <button className="tab-item">BEVAKNINGSLISTA</button>
                        <button className="tab-item">ALLA BOLAG</button>
                    </div>
                    <div>
                        {[
                            { time: "00:00", date: "9 MAR", name: "Lån og Spar Bank", event: "Årsstämma" },
                            { time: "00:00", date: "9 MAR", name: "WS Wesports Group", event: "Extra Bolagsstämma 2026" },
                            { time: "00:00", date: "9 MAR", name: "Solstad Offshore", event: "Extra Bolagsstämma 2026" },
                            { time: "00:00", date: "9 MAR", name: "Eikom", event: "Extra Bolagsstämma 2026" },
                            { time: "00:00", date: "9 MAR", name: "Spir Group", event: "15-6 2026" },
                            { time: "00:00", date: "10 MAR", name: "Hunter Capital", event: "" },
                        ].map((ev, i) => (
                            <div key={i} className="feed-row">
                                <div style={{ width: "36px", textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>{ev.time}</div>
                                    <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{ev.date}</div>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>{ev.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.event}</div>
                                </div>
                                <span className="heart-btn" style={{ fontSize: "14px" }}>♡</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* ===== CENTER COLUMN — Main Feed ===== */}
            <main style={{ minWidth: 0 }}>
                <div className="card-section">
                    <div className="tab-nav" style={{ padding: "0 16px" }}>
                        <button className="tab-item active">BOLAGSKOMMUNIKATION</button>
                        <button className="tab-item">BEVAKNINGSLISTA</button>
                        <button className="tab-item">ALLA BOLAG</button>
                    </div>

                    <div style={{ display: "flex", gap: "8px", padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                        {["⚙ Marknader", "Typ", "Övrigt"].map((f) => (
                            <div key={f} style={{
                                display: "flex", alignItems: "center", gap: "4px",
                                padding: "5px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                borderRadius: "var(--radius-pill)", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer",
                            }}>
                                {f} <span style={{ opacity: 0.4, fontSize: "8px" }}>▼</span>
                            </div>
                        ))}
                    </div>

                    {allItems.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                            <p style={{ fontSize: "14px", marginBottom: "8px" }}>Inga pressmeddelanden hittades</p>
                            <p style={{ fontSize: "12px" }}>Kontrollera att seed-data finns i databasen</p>
                        </div>
                    ) : (
                        allItems.map((pr, index) => {
                            const company = pr.companies;
                            return (
                                <Link key={pr.id} href={`/company/${company.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <div className="feed-row animate-in" style={{ animationDelay: `${index * 30}ms`, opacity: 0 }}>
                                        <div style={{ width: "38px", textAlign: "right", flexShrink: 0 }}>
                                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                                                {new Date(pr.published_at).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                                                {new Date(pr.published_at).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="company-logo">{company.ticker.slice(0, 2)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontWeight: 600, fontSize: "13px" }}>{company.name}</span>
                                                {company.is_fairvalue_customer && <span style={{ fontSize: "12px" }}>🔒</span>}
                                                {pr.category && <span className="badge badge-pr">{pr.category === "Rapport" ? "PR" : "PR"}</span>}
                                            </div>
                                        </div>
                                        <span className="heart-btn" style={{ fontSize: "14px" }}>♡</span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </main>

            {/* ===== RIGHT COLUMN ===== */}
            <aside className="desktop-only">
                {/* Fördjupningar */}
                <div className="card-section" style={{ marginBottom: "16px" }}>
                    <div className="tab-nav" style={{ padding: "0 12px" }}>
                        <button className="tab-item active" style={{ padding: "10px 10px", fontSize: "10px" }}>FÖRDJUPNINGAR</button>
                        <button className="tab-item" style={{ padding: "10px 10px", fontSize: "10px" }}>BEVAKNINGSLISTA</button>
                        <button className="tab-item" style={{ padding: "10px 10px", fontSize: "10px" }}>ALLA BOLAG</button>
                    </div>
                    {allItems.slice(0, 6).map((pr) => (
                        <Link key={`f-${pr.id}`} href={`/company/${pr.companies.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="feed-row" style={{ padding: "8px 12px" }}>
                                <div style={{ width: "36px", textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>
                                        {new Date(pr.published_at).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "var(--text-faint)" }}>
                                        {new Date(pr.published_at).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontWeight: 600, fontSize: "12px" }}>{pr.companies.name}</span>
                                        <span className="badge badge-neutral" style={{ fontSize: "9px" }}>INFÖR RAPPORT</span>
                                    </div>
                                </div>
                                <span className="heart-btn" style={{ fontSize: "12px" }}>♡</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Anomalier */}
                <div className="card-section">
                    <div className="tab-nav" style={{ padding: "0 12px" }}>
                        <button className="tab-item active" style={{ padding: "10px 10px", fontSize: "10px" }}>ANOMALIER</button>
                        <button className="tab-item" style={{ padding: "10px 10px", fontSize: "10px" }}>BEVAKNINGSLISTA</button>
                        <button className="tab-item" style={{ padding: "10px 10px", fontSize: "10px" }}>ALLA BOLAG</button>
                    </div>
                    {allItems.slice(0, 6).map((pr) => (
                        <Link key={`a-${pr.id}`} href={`/company/${pr.companies.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="feed-row" style={{ padding: "8px 12px" }}>
                                <div style={{ width: "36px", textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>
                                        {new Date(pr.published_at).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "var(--text-faint)" }}>
                                        {new Date(pr.published_at).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontWeight: 600, fontSize: "12px" }}>{pr.companies.name}</span>
                                        <span className="badge badge-cautious" style={{ fontSize: "9px" }}>PRISLARM</span>
                                    </div>
                                </div>
                                <span className="heart-btn" style={{ fontSize: "12px" }}>♡</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </aside>
        </div>
    );
}
