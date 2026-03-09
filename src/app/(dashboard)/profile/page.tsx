"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Profil & Inställningar</h1>

            <div className="card-section" style={{ padding: "24px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "50%", background: "var(--brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "18px", color: "white",
                    }}>{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "16px" }}>{displayName}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{user?.email}</div>
                    </div>
                </div>

                <div className="section-label">KONTO</div>
                <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>E-post</label>
                    <input type="email" value={user?.email || ""} readOnly className="input" style={{ opacity: 0.7 }} />
                </div>
                <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px", display: "block" }}>Namn</label>
                    <input type="text" value={displayName} readOnly className="input" style={{ opacity: 0.7 }} />
                </div>
            </div>

            <div className="card-section" style={{ padding: "24px" }}>
                <div className="section-label">PRENUMERATION</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>Insights Free</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Grundläggande AI-sammanfattningar</div>
                    </div>
                    <span className="badge badge-brand">Aktiv</span>
                </div>
                <button className="btn-primary" style={{ width: "100%" }}>Uppgradera till Pro</button>
            </div>
        </div>
    );
}
