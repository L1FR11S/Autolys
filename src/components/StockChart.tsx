"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

interface StockPoint {
    date: string;  // "YYYY-MM-DD"
    close_price: number;
}

interface StockChartProps {
    ticker: string; // Yahoo Finance ticker, t.ex. "ABIG.ST"
}

const PERIODS = [
    { label: "30D", tradingDays: 22 },  // 22 handelsdagar ≈ 1 månad
    { label: "90D", tradingDays: 65 },  // 65 handelsdagar ≈ 3 månader
    { label: "180D", tradingDays: 130 },  // 130 handelsdagar ≈ 6 månader
    { label: "1Y", tradingDays: 252 },  // 252 handelsdagar ≈ 1 år
];

/** Visa rätt antal decimaler baserat på prisnivå */
function fmtPrice(price: number): string {
    if (price === 0) return "0.00";
    if (price < 0.01) return price.toFixed(6);
    if (price < 0.1) return price.toFixed(4);
    if (price < 1) return price.toFixed(3);
    if (price < 100) return price.toFixed(2);
    return price.toFixed(1);
}

function formatDate(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    if (days <= 30) return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Oct 1"
}

export default function StockChart({ ticker }: StockChartProps) {
    const [periodIdx, setPeriodIdx] = useState(2); // 180D default
    const period = PERIODS[periodIdx];
    const [points, setPoints] = useState<StockPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; date: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        setLoading(true);
        setError(false);
        const supabase = createClient();

        // Hämta de senaste N handelsdagarna (order desc, limit N, sedan vänd ordning)
        supabase
            .from("stock_prices")
            .select("date, close_price")
            .eq("ticker", ticker)
            .order("date", { ascending: false })
            .limit(period.tradingDays)
            .then(({ data, error: dbErr }) => {
                if (dbErr || !data || data.length === 0) {
                    setError(true);
                } else {
                    const parsed = ([...data] as { date: string; close_price: string | number }[])
                        .reverse() // äldst först
                        .map((r) => ({ date: r.date, close_price: Number(r.close_price) }))
                        .filter((r) => !isNaN(r.close_price) && r.close_price > 0);
                    setPoints(parsed);
                }
                setLoading(false);
            });
    }, [ticker, periodIdx]);

    // ===== Beräkna SVG-koordinater =====
    const W = 560, H = 220;
    const PAD = { top: 12, right: 52, bottom: 32, left: 8 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const prices = points.map((p) => p.close_price);
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 1;
    const range = maxP - minP || 1;
    const padY = range * 0.08; // lite luft top/bottom

    const px = (i: number) => PAD.left + (i / Math.max(points.length - 1, 1)) * chartW;
    const py = (price: number) => PAD.top + chartH - ((price - (minP - padY)) / (range + 2 * padY)) * chartH;

    // Polyline-punkter
    const linePoints = points.map((p, i) => `${px(i)},${py(p.close_price)}`).join(" ");

    // Area-path (fyll under linjen)
    const areaPath = points.length
        ? `M ${px(0)},${py(points[0].close_price)} ` +
        points.map((p, i) => `L ${px(i)},${py(p.close_price)}`).join(" ") +
        ` L ${px(points.length - 1)},${H - PAD.bottom} L ${px(0)},${H - PAD.bottom} Z`
        : "";

    // Y-axel-tickar (6 st)
    const yTicks = Array.from({ length: 6 }, (_, i) => {
        const price = minP - padY + (i / 5) * (range + 2 * padY);
        return { price, y: py(price) };
    }).reverse();

    // X-axel – månadsstart-tickar
    const xTicks: { label: string; x: number }[] = [];
    if (points.length > 1) {
        let lastMonth = -1;
        points.forEach((p, i) => {
            const m = new Date(p.date).getMonth();
            if (m !== lastMonth) {
                lastMonth = m;
                xTicks.push({
                    label: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    x: px(i),
                });
            }
        });
    }

    // Ändring sedan period-start
    const change = points.length >= 2
        ? ((points[points.length - 1].close_price - points[0].close_price) / points[0].close_price) * 100
        : null;
    const isPositive = change !== null && change >= 0;

    // Tooltip-interaktion
    function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
        if (!svgRef.current || points.length < 2) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * W;
        const relX = mouseX - PAD.left;
        const idx = Math.round((relX / chartW) * (points.length - 1));
        const clamped = Math.max(0, Math.min(points.length - 1, idx));
        const p = points[clamped];
        setTooltip({ x: px(clamped), y: py(p.close_price), price: p.close_price, date: p.date });
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Periode-väljare */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginBottom: "12px" }}>
                {PERIODS.map((p, i) => {
                    const active = i === periodIdx;
                    return (
                        <button
                            key={p.label}
                            onClick={() => setPeriodIdx(i)}
                            style={{
                                padding: "4px 12px", borderRadius: "var(--radius-pill)",
                                fontSize: "12px", fontWeight: active ? 700 : 400,
                                border: "1px solid",
                                borderColor: active ? "var(--brand)" : "transparent",
                                background: active ? "rgba(13,161,156,0.15)" : "transparent",
                                color: active ? "var(--brand)" : "var(--text-muted)",
                                cursor: "pointer", fontFamily: "inherit", transition: "all var(--transition)",
                            }}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            {/* Ändring % */}
            {change !== null && (
                <div style={{ fontSize: "12px", color: isPositive ? "var(--positive)" : "var(--negative)", marginBottom: "8px", textAlign: "right" }}>
                    {isPositive ? "\u25b2" : "\u25bc"} {Math.abs(change).toFixed(1)}% ({period.label})
                </div>
            )}

            {/* Graf */}
            {loading ? (
                <div className="skeleton" style={{ width: "100%", height: `${H}px`, borderRadius: "8px" }} />
            ) : error || points.length === 0 ? (
                <div style={{ height: `${H}px`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Kursdata saknas för {ticker}</span>
                </div>
            ) : (
                <svg
                    ref={svgRef}
                    width="100%"
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ overflow: "visible", cursor: "crosshair" }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                >
                    <defs>
                        {/* Gradient fyllnad under linjen */}
                        <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
                        </linearGradient>
                        {/* Linjens gradient (vit → brand vid slutet) */}
                        <linearGradient id={`line-grad-${ticker}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
                            <stop offset="80%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="var(--brand)" />
                        </linearGradient>
                        {/* Clip för grafen */}
                        <clipPath id={`clip-${ticker}`}>
                            <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
                        </clipPath>
                    </defs>

                    {/* Horisontella grid-linjer */}
                    {yTicks.map((t, i) => (
                        <g key={i}>
                            <line
                                x1={PAD.left} y1={t.y}
                                x2={W - PAD.right} y2={t.y}
                                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                            />
                            <text
                                x={W - PAD.right + 8} y={t.y + 4}
                                fontSize="10" fill="var(--text-muted)" textAnchor="start"
                                style={{ fontFamily: "inherit" }}
                            >
                                {fmtPrice(t.price)}
                            </text>
                        </g>
                    ))}

                    {/* Clip-path för area + linje */}
                    <g clipPath={`url(#clip-${ticker})`}>
                        {/* Area-fyllnad */}
                        <path d={areaPath} fill={`url(#grad-${ticker})`} />

                        {/* Kurs-linje */}
                        <polyline
                            points={linePoints}
                            fill="none"
                            stroke={`url(#line-grad-${ticker})`}
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* X-axel månadstickar */}
                    {xTicks.map((t, i) => (
                        <text
                            key={i} x={t.x} y={H - 6}
                            fontSize="10" fill="var(--text-muted)" textAnchor="middle"
                            style={{ fontFamily: "inherit" }}
                        >
                            {t.label}
                        </text>
                    ))}

                    {/* Tooltip */}
                    {tooltip && (
                        <g>
                            {/* Vertikal linje */}
                            <line
                                x1={tooltip.x} y1={PAD.top}
                                x2={tooltip.x} y2={H - PAD.bottom}
                                stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3"
                            />
                            {/* Punkt på linjen */}
                            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="var(--brand)" stroke="var(--bg-card)" strokeWidth="2" />
                            {/* Tooltip-ruta */}
                            <g transform={`translate(${Math.min(tooltip.x + 8, W - 100)},${Math.max(tooltip.y - 28, PAD.top)})`}>
                                <rect width="92" height="34" rx="5" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
                                <text x="8" y="13" fontSize="10" fill="var(--text-muted)" style={{ fontFamily: "inherit" }}>
                                    {new Date(tooltip.date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                                </text>
                                <text x="8" y="27" fontSize="12" fontWeight="700" fill="var(--text-primary)" style={{ fontFamily: "inherit" }}>
                                    {fmtPrice(tooltip.price)} SEK
                                </text>
                            </g>
                        </g>
                    )}
                </svg>
            )}
        </div>
    );
}
