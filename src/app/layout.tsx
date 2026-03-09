import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Autolys — AI-driven investerarintelligens",
    description:
        "Automatisk analys och sammanfattning av IR-kommunikation från noterade bolag. Pressmeddelanden, rapporter och VD-intervjuer — sammanfattade med AI.",
    keywords: ["investering", "AI", "aktier", "pressmeddelanden", "rapporter", "IR"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="sv" className={inter.variable}>
            <body>{children}</body>
        </html>
    );
}
