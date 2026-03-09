"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/feed", icon: "🏠", label: "Flöde" },
    { href: "/explore", icon: "🔍", label: "Utforska" },
    { href: "/watchlist", icon: "⭐", label: "Bevakning" },
    { href: "/profile", icon: "👤", label: "Profil" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="desktop-sidebar"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "var(--sidebar-width)",
                background: "var(--bg-primary)",
                borderRight: "1px solid var(--border-primary)",
                display: "flex",
                flexDirection: "column",
                zIndex: 50,
            }}
        >
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px" }}>
                <Link
                    href="/feed"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textDecoration: "none",
                    }}
                >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="7" fill="#0a0a0a" />
                        <text
                            x="14"
                            y="19"
                            textAnchor="middle"
                            fill="white"
                            fontWeight="800"
                            fontSize="16"
                            fontFamily="Inter, sans-serif"
                        >
                            A
                        </text>
                    </svg>
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: "17px",
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Autolys
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ padding: "4px 10px", flex: 1 }}>
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 600 : 500,
                                color: isActive
                                    ? "var(--text-primary)"
                                    : "var(--text-secondary)",
                                background: isActive ? "var(--bg-secondary)" : "transparent",
                                transition: "all var(--transition-fast)",
                                marginBottom: "2px",
                            }}
                        >
                            <span style={{ fontSize: "1rem", opacity: isActive ? 1 : 0.7 }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div style={{ padding: "12px" }}>
                <div
                    style={{
                        padding: "14px",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                    }}
                >
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                        Uppgradera till Pro
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                        Obegränsat antal bolag, AI-chat & alerts
                    </p>
                    <button
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: "0.8125rem" }}
                    >
                        Uppgradera
                    </button>
                </div>
            </div>
        </aside>
    );
}
