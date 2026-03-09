"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const popularCompanies = [
    { name: "Plejd", ticker: "PLEJD" },
    { name: "Fortnox", ticker: "FNOX" },
    { name: "Hexatronic", ticker: "HTRO" },
    { name: "MIPS", ticker: "MIPS" },
    { name: "HomeMaid", ticker: "HOME B" },
    { name: "EQL Pharma", ticker: "EQL" },
];

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState<"register" | "select">("register");
    const [selected, setSelected] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggle = (t: string) => setSelected((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { display_name: email.split("@")[0] } } });
        if (authError) { setError(authError.message); setLoading(false); return; }
        setLoading(false);
        setStep("select");
    }

    async function handleFinish() {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: companies } = await supabase.from("companies").select("id, ticker").in("ticker", selected);
            if (companies) {
                await supabase.from("user_follows").insert(companies.map((c) => ({ user_id: user.id, company_id: c.id })));
            }
        }
        router.push("/feed");
        router.refresh();
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg-body)" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <path d="M6 16L16 6L26 16L16 26Z" fill="var(--brand)" />
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: "17px" }}>Autolys</span>
                    </Link>
                </div>
                <div className="card-section" style={{ padding: "32px" }}>
                    {step === "register" ? (
                        <>
                            <h1 style={{ fontSize: "20px", fontWeight: 800, textAlign: "center", marginBottom: "4px" }}>Skapa konto</h1>
                            <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "24px", fontSize: "13px" }}>Gratis att komma igång</p>
                            {error && <div style={{ background: "var(--negative-bg)", color: "var(--negative)", fontSize: "13px", padding: "10px 14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>{error}</div>}
                            <form onSubmit={handleRegister}>
                                <div style={{ marginBottom: "14px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>E-post</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="din@email.se" required className="input" disabled={loading} />
                                </div>
                                <div style={{ marginBottom: "22px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>Lösenord</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minst 6 tecken" required minLength={6} className="input" disabled={loading} />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "11px", opacity: loading ? 0.6 : 1 }}>
                                    {loading ? "Skapar konto..." : "Fortsätt →"}
                                </button>
                            </form>
                            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                                Redan konto?{" "}<Link href="/login" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Logga in</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: "20px", fontWeight: 800, textAlign: "center", marginBottom: "4px" }}>Välj bolag</h1>
                            <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "20px", fontSize: "13px" }}>Minst 3 för att bygga ditt flöde</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "20px" }}>
                                {popularCompanies.map((c) => {
                                    const sel = selected.includes(c.ticker);
                                    return (
                                        <button key={c.ticker} onClick={() => toggle(c.ticker)} style={{
                                            padding: "12px", borderRadius: "var(--radius-md)", textAlign: "left", fontFamily: "inherit",
                                            border: sel ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                                            background: sel ? "var(--brand-dim)" : "var(--bg-elevated)", cursor: "pointer", color: "var(--text-primary)",
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: "13px" }}>{c.name}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.ticker}</div>
                                            {sel && <span style={{ fontSize: "10px", color: "var(--brand)", fontWeight: 700 }}>✓ Vald</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            <button className="btn-primary" onClick={handleFinish} disabled={selected.length < 3 || loading}
                                style={{ width: "100%", padding: "11px", opacity: (selected.length < 3 || loading) ? 0.4 : 1 }}>
                                {loading ? "Sätter upp..." : `Starta mitt flöde (${selected.length}/3)`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
