import Link from "next/link";

/* ===== Animated grid pattern (CSS-only) ===== */
function GridPattern() {
    return (
        <div style={{
            position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
        }}>
            <div style={{
                position: "absolute", inset: "-50%", width: "200%", height: "200%",
                backgroundImage:
                    "linear-gradient(rgba(13,161,156,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(13,161,156,0.07) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
            }} />
        </div>
    );
}

/* ===== Floating orbs ===== */
function GlowOrbs() {
    return (
        <>
            <div style={{
                position: "absolute", top: "10%", left: "15%", width: "500px", height: "500px",
                background: "radial-gradient(circle, rgba(13,161,156,0.12) 0%, transparent 70%)",
                filter: "blur(80px)", pointerEvents: "none",
                animation: "orbFloat 15s ease-in-out infinite",
            }} />
            <div style={{
                position: "absolute", top: "60%", right: "10%", width: "400px", height: "400px",
                background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                filter: "blur(80px)", pointerEvents: "none",
                animation: "orbFloat 20s ease-in-out infinite reverse",
            }} />
        </>
    );
}

/* ===== Stat counter ===== */
function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--brand)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                {value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: 500 }}>
                {label}
            </div>
        </div>
    );
}

/* ===== Feature card ===== */
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent?: string }) {
    return (
        <div style={{
            padding: "28px", borderRadius: "var(--radius-lg)",
            background: "rgba(17,26,46,0.5)", border: "1px solid rgba(30,41,59,0.6)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            transition: "all 200ms ease", cursor: "default",
            position: "relative", overflow: "hidden",
        }}
            className="feature-card"
        >
            {/* Subtle glow in top corner */}
            {accent && (
                <div style={{
                    position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px",
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                    opacity: 0.15, pointerEvents: "none",
                }} />
            )}
            <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: accent ? `${accent}15` : "var(--brand-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px", fontSize: "18px",
                color: accent || "var(--brand)",
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.01em" }}>
                {title}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {desc}
            </p>
        </div>
    );
}

/* ===== Mock feed preview card ===== */
function MockFeedItem({ company, ticker, title, sentiment, time }: {
    company: string; ticker: string; title: string; sentiment: "positive" | "cautious" | "neutral"; time: string;
}) {
    const sentimentColors = { positive: "var(--positive)", cautious: "var(--cautious)", neutral: "var(--text-muted)" };
    const sentimentBg = { positive: "var(--positive-bg)", cautious: "var(--cautious-bg)", neutral: "var(--bg-elevated)" };
    const sentimentLabel = { positive: "Positiv", cautious: "Försiktig", neutral: "Neutral" };
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
            borderBottom: "1px solid rgba(30,41,59,0.5)", transition: "background 150ms",
        }}>
            <div style={{
                width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-elevated)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "11px", color: "var(--text-secondary)",
                border: "1px solid var(--border)", flexShrink: 0,
            }}>
                {ticker.slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px" }}>{company}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'SF Mono', monospace" }}>{ticker}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {title}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <span style={{
                    padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600,
                    background: sentimentBg[sentiment], color: sentimentColors[sentiment],
                }}>
                    {sentimentLabel[sentiment]}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>{time}</span>
            </div>
        </div>
    );
}

/* ===== Testimonial ===== */
function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
    return (
        <div style={{
            padding: "24px", borderRadius: "var(--radius-lg)",
            background: "rgba(17,26,46,0.4)", border: "1px solid rgba(30,41,59,0.5)",
        }}>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "16px" }}>
                &ldquo;{quote}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "12px", color: "var(--brand)",
                }}>
                    {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{role}</div>
                </div>
            </div>
        </div>
    );
}

/* ===== Step card ===== */
function StepCard({ number, title, desc }: { number: number; title: string; desc: string }) {
    return (
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--brand-dim)", border: "1px solid rgba(13,161,156,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "14px", color: "var(--brand)", flexShrink: 0,
            }}>
                {number}
            </div>
            <div>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "4px" }}>{title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
            </div>
        </div>
    );
}


export default function LandingPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-body)", color: "var(--text-primary)" }}>
            {/* CSS keyframes */}
            <style>{`
                @keyframes orbFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.95); }
                }
                @keyframes heroFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroFadeInDelay {
                    0%, 15% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroFadeInDelay2 {
                    0%, 30% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .feature-card:hover {
                    border-color: rgba(13,161,156,0.35) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(13,161,156,0.08);
                }
                .nav-link {
                    position: relative;
                    transition: color 150ms ease;
                }
                .nav-link:hover {
                    color: var(--text-primary) !important;
                }
                .cta-btn-hero {
                    position: relative;
                    overflow: hidden;
                }
                .cta-btn-hero::after {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    transition: left 400ms ease;
                }
                .cta-btn-hero:hover::after {
                    left: 100%;
                }
            `}</style>

            {/* ===== Navigation ===== */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 20px", position: "fixed", top: "12px", left: "50%",
                transform: "translateX(-50%)", width: "min(calc(100% - 32px), 960px)",
                zIndex: 100, background: "rgba(11,17,32,0.75)", backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(30,41,59,0.6)", borderRadius: "var(--radius-pill)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                        <path d="M6 16L16 6L26 16L16 26Z" fill="var(--brand)" />
                        <path d="M11 16L16 11L21 16L16 21Z" fill="rgba(13,161,156,0.3)" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em" }}>Autolys</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <Link href="/explore" className="nav-link" style={{ padding: "7px 14px", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", borderRadius: "var(--radius-md)" }}>
                        Utforska
                    </Link>
                    <Link href="/login" className="nav-link" style={{ padding: "7px 14px", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", borderRadius: "var(--radius-md)" }}>
                        Logga in
                    </Link>
                    <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", marginLeft: "4px", fontSize: "13px" }}>
                        Kom igång
                    </Link>
                </div>
            </nav>

            {/* ===== Hero ===== */}
            <section style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "120px 24px 80px", position: "relative", overflow: "hidden",
            }}>
                <GridPattern />
                <GlowOrbs />
                <div style={{ maxWidth: "800px", width: "100%", position: "relative", textAlign: "center" }}>
                    {/* Badge */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "6px 16px", borderRadius: "var(--radius-pill)",
                        background: "var(--brand-dim)", border: "1px solid rgba(13,161,156,0.2)",
                        marginBottom: "28px", animation: "heroFadeIn 0.6s ease forwards",
                    }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--brand)", animation: "pulse 2s ease-in-out infinite" }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand)", letterSpacing: "0.02em" }}>
                            AI-driven investerarintelligens
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: "clamp(2.75rem, 6vw, 4.5rem)", fontWeight: 800,
                        lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "20px",
                        animation: "heroFadeIn 0.8s ease forwards",
                    }}>
                        Förstå bolagen<br />
                        <span style={{
                            background: "linear-gradient(135deg, var(--brand) 0%, #0fb8b2 50%, #6366f1 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            på sekunder
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: "1.125rem", lineHeight: 1.7, color: "var(--text-secondary)",
                        maxWidth: "560px", margin: "0 auto 36px",
                        animation: "heroFadeInDelay 1s ease forwards",
                    }}>
                        Autolys sammanfattar pressmeddelanden, rapporter och VD-intervjuer med AI&nbsp;— så att du kan fokusera på att investera, inte läsa.
                    </p>

                    {/* CTA */}
                    <div style={{
                        display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap",
                        animation: "heroFadeInDelay2 1.2s ease forwards",
                    }}>
                        <Link href="/register" className="cta-btn-hero" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "14px 32px", background: "var(--brand)", color: "#fff",
                            borderRadius: "var(--radius-pill)", fontSize: "15px", fontWeight: 700,
                            textDecoration: "none", transition: "all 200ms ease",
                            boxShadow: "0 0 24px rgba(13,161,156,0.3), 0 4px 16px rgba(0,0,0,0.3)",
                        }}>
                            Kom igång gratis
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href="/explore" style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "14px 28px", background: "transparent",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-pill)",
                            color: "var(--text-secondary)", fontSize: "15px", fontWeight: 600,
                            textDecoration: "none", transition: "all 200ms ease",
                        }}>
                            Utforska bolag
                        </Link>
                    </div>

                    {/* Trusted by */}
                    <div style={{
                        marginTop: "56px",
                        animation: "heroFadeInDelay2 1.4s ease forwards", opacity: 0,
                    }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: "16px" }}>
                            Analyserar bolag noterade på
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
                            {["Nordic SME", "First North", "Mid Cap", "Large Cap"].map((label) => (
                                <span key={label} style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em" }}>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Stats ===== */}
            <section style={{
                padding: "60px 24px", maxWidth: "900px", margin: "0 auto",
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px",
                borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
            }}>
                <Stat value="68+" label="Bolag analyserade" />
                <Stat value="AI" label="Claude-driven analys" />
                <Stat value="24/7" label="Automatisk bevakning" />
                <Stat value="0 kr" label="Gratis att börja" />
            </section>

            {/* ===== Features ===== */}
            <section style={{ padding: "100px 24px", maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--brand)", marginBottom: "12px" }}>
                        Funktioner
                    </p>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                        Allt du behöver som investerare
                    </h2>
                    <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
                        Sluta scrolla genom PDF:er och pressmeddelanden. Autolys destillerar det viktigaste åt dig.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
                        title="AI-sammanfattningar"
                        desc="Varje pressmeddelande analyseras av Claude AI och sammanfattas med nyckelinsikter, sentiment och key takeaways — på sekunder."
                        accent="rgba(13,161,156,1)"
                    />
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
                        title="Triggers & Sentiment"
                        desc="Identifierar automatiskt positiva och negativa triggers med konkreta tröskelvärden. Förstå vad som driver kursen."
                        accent="rgba(16,185,129,1)"
                    />
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>}
                        title="Nyckeltal-extraktion"
                        desc="AI extraherar automatiskt omsättning, EBITDA, marginaler och andra KPI:er direkt ur rapporter och pressmeddelanden."
                        accent="rgba(99,102,241,1)"
                    />
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>}
                        title="Personligt flöde"
                        desc="Följ bolag du äger eller bevakar. Få ett kurerat AI-drivet flöde med de senaste händelserna — anpassat för dig."
                        accent="rgba(245,158,11,1)"
                    />
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                        title="Utforska & Upptäck"
                        desc="Bläddra bland noterade bolag, filtrera på sektor och marknadsplats. Hitta nästa investering."
                        accent="rgba(236,72,153,1)"
                    />
                    <FeatureCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                        title="Fråga Autolys"
                        desc="Ställ frågor om valfritt bolag. AI:n har kontext från alla pressmeddelanden och rapporter."
                        accent="rgba(168,85,247,1)"
                    />
                </div>
            </section>

            {/* ===== Live Preview / Demo ===== */}
            <section style={{ padding: "80px 24px 100px", maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "48px", alignItems: "center" }}>
                    {/* Left - text */}
                    <div>
                        <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--brand)", marginBottom: "12px" }}>
                            Ditt flöde
                        </p>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                            Allt viktigt, på ett ställe
                        </h2>
                        <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "28px" }}>
                            Ditt personliga investerarflöde samlar AI-analyserade pressmeddelanden, sentiment-indikatorer och nyckeltal från alla bolag du följer.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <StepCard number={1} title="Skapa konto" desc="Ta 30 sekunder. Helt gratis." />
                            <StepCard number={2} title="Välj dina bolag" desc="Välj bland 68+ bolag på Nordic SME, First North och mer." />
                            <StepCard number={3} title="Få AI-insikter" desc="Flödet fylls med sammanfattningar, triggers och nyckeltal — automatiskt." />
                        </div>
                    </div>

                    {/* Right - mock feed */}
                    <div style={{
                        borderRadius: "var(--radius-lg)", overflow: "hidden",
                        background: "rgba(17,26,46,0.6)", border: "1px solid rgba(30,41,59,0.7)",
                        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(13,161,156,0.05)",
                    }}>
                        {/* Mock header */}
                        <div style={{
                            padding: "14px 16px", borderBottom: "1px solid rgba(30,41,59,0.5)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <span style={{ fontWeight: 700, fontSize: "14px" }}>📡 Mitt Flöde</span>
                            <span style={{
                                padding: "3px 10px", borderRadius: "var(--radius-pill)",
                                background: "var(--brand-dim)", color: "var(--brand)",
                                fontSize: "10px", fontWeight: 700,
                            }}>
                                LIVE
                            </span>
                        </div>
                        <MockFeedItem
                            company="Plejd" ticker="PLEJD"
                            title="Rapporterar 41% omsättningstillväxt i Q4 2025"
                            sentiment="positive" time="2h sedan"
                        />
                        <MockFeedItem
                            company="Hexatronic" ticker="HTRO"
                            title="Säkrar stor order på 120 MSEK från USA"
                            sentiment="positive" time="5h sedan"
                        />
                        <MockFeedItem
                            company="EQL Pharma" ticker="EQL"
                            title="Marknadsgodkännande för ny generisk specialprodukt"
                            sentiment="cautious" time="1d sedan"
                        />
                        <MockFeedItem
                            company="Fortnox" ticker="FNOX"
                            title="Rekordår med 2,4 miljarder SEK i intäkter"
                            sentiment="positive" time="2d sedan"
                        />
                        <MockFeedItem
                            company="MIPS" ticker="MIPS"
                            title="Tecknar nytt licensavtal med global tillverkare"
                            sentiment="neutral" time="3d sedan"
                        />
                        {/* Fade out bottom */}
                        <div style={{
                            height: "48px",
                            background: "linear-gradient(to top, rgba(17,26,46,0.95), transparent)",
                        }} />
                    </div>
                </div>
            </section>

            {/* ===== Testimonials ===== */}
            <section style={{
                padding: "80px 24px", maxWidth: "1000px", margin: "0 auto",
                borderTop: "1px solid var(--border)",
            }}>
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--brand)", marginBottom: "12px" }}>
                        Röster
                    </p>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                        Byggd för smarta investerare
                    </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                    <Testimonial
                        quote="Jag brukade spendera timmar på att läsa igenom PM varje morgon. Nu får jag allt sammanfattat med AI på 30 sekunder."
                        name="Anna Lindqvist"
                        role="Privatinvesterare"
                    />
                    <Testimonial
                        quote="Triggers-funktionen är genial. Att direkt se positiva och negativa scenarier hjälper mig fatta bättre beslut."
                        name="Erik Johansson"
                        role="Aktiv trader"
                    />
                    <Testimonial
                        quote="Äntligen en plattform som förstår nordiska small caps. Perfekt för att hålla koll på min portfölj av First North-bolag."
                        name="Maria Svensson"
                        role="Small Cap-investerare"
                    />
                </div>
            </section>

            {/* ===== Final CTA ===== */}
            <section style={{
                padding: "100px 24px", textAlign: "center",
                position: "relative", overflow: "hidden",
            }}>
                {/* Glow */}
                <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                    width: "600px", height: "400px",
                    background: "radial-gradient(ellipse, rgba(13,161,156,0.1) 0%, transparent 70%)",
                    filter: "blur(60px)", pointerEvents: "none",
                }} />
                <div style={{ position: "relative" }}>
                    <h2 style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                        Redo att investera smartare?
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "440px", margin: "0 auto 32px", fontSize: "1rem", lineHeight: 1.6 }}>
                        Gå med tusentals investerare som redan använder AI för att förstå marknaden. Helt gratis att börja.
                    </p>
                    <Link href="/register" className="cta-btn-hero" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "16px 40px", background: "var(--brand)", color: "#fff",
                        borderRadius: "var(--radius-pill)", fontSize: "16px", fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 0 40px rgba(13,161,156,0.3), 0 8px 24px rgba(0,0,0,0.3)",
                    }}>
                        Skapa konto gratis
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-faint)" }}>
                        Inga kreditkort. Ingen bindningstid. Bara insikter.
                    </p>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <footer style={{
                padding: "32px 24px", borderTop: "1px solid var(--border)",
                maxWidth: "1000px", margin: "0 auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "16px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                            <path d="M6 16L16 6L26 16L16 26Z" fill="var(--brand)" />
                            <path d="M11 16L16 11L21 16L16 21Z" fill="rgba(13,161,156,0.3)" />
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: "14px" }}>Autolys</span>
                        <span style={{ fontSize: "12px", color: "var(--text-faint)", marginLeft: "4px" }}>
                            En del av Fairvalue-ekosystemet
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <Link href="/explore" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>Utforska</Link>
                        <Link href="/login" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>Logga in</Link>
                        <Link href="/register" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>Registrera</Link>
                    </div>
                </div>
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <p style={{ color: "var(--text-faint)", fontSize: "11px" }}>
                        © 2026 Autolys. Informationen utgör inte investeringsrådgivning.
                    </p>
                    <p style={{ color: "var(--text-faint)", fontSize: "11px" }}>
                        Byggd med ❤️ i Sverige
                    </p>
                </div>
            </footer>
        </div>
    );
}
