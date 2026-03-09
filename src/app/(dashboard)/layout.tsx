"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navItems = [
    { href: "/feed", label: "Hem" },
    { href: "/watchlist", label: "Bevakningslista" },
    { href: "/explore", label: "Utforska" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [searchFocused, setSearchFocused] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <>
            {/* ===== Top Header — Pixel-identical to Quanor ===== */}
            <header className="top-header">
                <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
                    {/* Autolys logga – dubbla chevrons med gradient, premium stil */}
                    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="ag1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#4dfff5" />
                                <stop offset="100%" stopColor="#0da19c" />
                            </linearGradient>
                            <linearGradient id="ag2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#0da19c" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#0a7a76" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        {/* Bakre chevron – dämpad */}
                        <path d="M2 4L10 12L2 20" stroke="url(#ag2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Främre chevron – full gradient */}
                        <path d="M11 4L19 12L11 20" stroke="url(#ag1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Diamantpunkt */}
                        <circle cx="25" cy="12" r="2.5" fill="url(#ag1)" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Autolys</span>
                </Link>

                {/* Search */}
                <div style={{ flex: 1, maxWidth: "480px", margin: "0 auto", position: "relative" }}>
                    <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input type="text" placeholder="Sök bland 1500+ nordiska bolag" className="search-bar"
                        onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                    />
                </div>

                {/* Nav */}
                <nav className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0" }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link key={item.href} href={item.href} style={{
                                padding: "8px 16px", fontSize: "13px", fontWeight: isActive ? 600 : 500,
                                color: isActive ? "var(--brand)" : "var(--text-secondary)", textDecoration: "none",
                                transition: "color var(--transition)",
                            }}>
                                {item.label}
                            </Link>
                        );
                    })}
                    <div style={{ position: "relative", marginLeft: "4px" }}>
                        <Link href="#" className="btn-ghost" style={{ fontSize: "13px" }}>Mer <span style={{ opacity: 0.5 }}>▾</span></Link>
                    </div>
                </nav>

                {/* User */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <button onClick={() => setShowMenu(!showMenu)} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "4px 12px 4px 4px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-pill)", cursor: "pointer",
                    }}>
                        <div style={{
                            width: "28px", height: "28px", borderRadius: "50%", background: "var(--brand)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: "10px", color: "white",
                        }}>
                            {initials}
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{displayName}</div>
                            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Insights Free</div>
                        </div>
                    </button>
                    {showMenu && (
                        <div style={{
                            position: "absolute", right: 0, top: "44px", background: "var(--bg-card)",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.3)", padding: "6px", minWidth: "180px", zIndex: 200,
                        }}>
                            <div style={{ padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                                {user?.email}
                            </div>
                            <Link href="/profile" onClick={() => setShowMenu(false)} style={{
                                display: "block", padding: "8px 12px", fontSize: "13px", color: "var(--text-primary)",
                                textDecoration: "none", borderRadius: "var(--radius-md)",
                            }}>
                                Min profil
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: "13px",
                                color: "var(--negative)", background: "transparent", border: "none", borderRadius: "var(--radius-md)",
                                cursor: "pointer", fontFamily: "inherit",
                            }}>
                                Logga ut
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile nav */}
            <nav className="mobile-nav" style={{
                position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(11,17,32,0.92)",
                backdropFilter: "blur(12px)", borderTop: "1px solid var(--border)",
                display: "flex", justifyContent: "space-around",
                padding: "6px 0 max(6px, env(safe-area-inset-bottom))", zIndex: 50,
            }}>
                {[
                    { href: "/feed", label: "Hem" },
                    { href: "/watchlist", label: "Bevakning" },
                    { href: "/explore", label: "Utforska" },
                    { href: "/profile", label: "Profil" },
                ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", textDecoration: "none", padding: "4px 12px" }}>
                            <span style={{ fontSize: "0.5625rem", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--brand)" : "var(--text-muted)" }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <main style={{ paddingTop: "56px", minHeight: "100vh", padding: "56px 20px 80px" }}>
                {children}
            </main>
        </>
    );
}
