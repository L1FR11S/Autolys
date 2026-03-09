"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
            setError(authError.message === "Invalid login credentials" ? "Fel e-post eller lösenord" : authError.message);
            setLoading(false);
            return;
        }
        router.push("/feed");
        router.refresh();
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg-body)" }}>
            <div style={{ width: "100%", maxWidth: "380px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <path d="M6 16L16 6L26 16L16 26Z" fill="var(--brand)" />
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: "17px" }}>Autolys</span>
                    </Link>
                </div>
                <div className="card-section" style={{ padding: "32px" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 800, textAlign: "center", marginBottom: "4px" }}>Välkommen tillbaka</h1>
                    <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "24px", fontSize: "13px" }}>Logga in för att fortsätta</p>
                    {error && (
                        <div style={{ background: "var(--negative-bg)", color: "var(--negative)", fontSize: "13px", padding: "10px 14px", borderRadius: "var(--radius-md)", marginBottom: "16px", fontWeight: 500 }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>E-post</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="din@email.se" required className="input" disabled={loading} />
                        </div>
                        <div style={{ marginBottom: "22px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>Lösenord</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input" disabled={loading} />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "11px", opacity: loading ? 0.6 : 1 }}>
                            {loading ? "Loggar in..." : "Logga in"}
                        </button>
                    </form>
                    <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                        Inget konto?{" "}<Link href="/register" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Skapa konto</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
