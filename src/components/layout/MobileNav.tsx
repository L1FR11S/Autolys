"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/feed", label: "Flöde" },
    { href: "/explore", label: "Utforska" },
    { href: "/watchlist", label: "Bevakning" },
    { href: "/profile", label: "Profil" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav
            className="mobile-nav"
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderTop: "1px solid var(--border-primary)",
                display: "flex",
                justifyContent: "space-around",
                padding: "6px 0 max(6px, env(safe-area-inset-bottom))",
                zIndex: 50,
            }}
        >
            {navItems.map((item) => {
                const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "1px",
                            textDecoration: "none",
                            padding: "4px 12px",
                            flex: 1,
                            maxWidth: "72px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.625rem",
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                            }}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
