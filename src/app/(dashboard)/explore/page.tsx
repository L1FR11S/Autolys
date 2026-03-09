import Link from "next/link";
import { getCompanies } from "@/lib/api/companies";
import type { Company } from "@/lib/api/companies";

export default async function ExplorePage() {
    const companies = await getCompanies();

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "12px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>Utforska Bolag</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>Bläddra bland noterade bolag på Nordic SME och övriga listor</p>

            <div className="section-label">{companies.length} BOLAG</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
                {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
            {companies.length === 0 && <div className="card-section" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Inga bolag hittades</div>}
        </div>
    );
}

function CompanyCard({ company }: { company: Company }) {
    return (
        <Link href={`/company/${company.slug}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "16px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div className="company-logo">{company.ticker.slice(0, 2)}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{company.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{company.ticker} · {company.market_list}</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                    <span className="badge badge-neutral">{company.sector}</span>
                </div>
                <p className="truncate-2" style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{company.description}</p>
            </div>
        </Link>
    );
}
