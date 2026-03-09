/* ===== TypeScript Types for Autolys ===== */

export interface Company {
    id: string;
    name: string;
    slug: string;
    ticker: string;
    isin?: string | null;
    sector: string;
    market_list: string;
    description: string;
    logo_url: string | null;
    website_url: string | null;
    ngm_url?: string | null;
    rss_feed_url: string | null;
    is_fairvalue_customer: boolean;
    created_at: string;
}

export interface PressRelease {
    id: string;
    company_id: string;
    title: string;
    content: string | null;
    source_url: string;
    published_at: string;
    category: string | null;
    ai_summary: string | null;
    key_takeaways: string[] | null;
    sentiment_score: number | null;
    created_at: string;
    // Joined
    company?: Company;
}

export interface UserFollow {
    id: string;
    user_id: string;
    company_id: string;
    created_at: string;
    // Joined
    company?: Company;
}

export interface AISummary {
    id: string;
    company_id: string;
    summary_type: 'overview' | 'latest_news';
    content: string;
    generated_at: string;
}

export type Sentiment = 'positive' | 'neutral' | 'cautious' | 'negative';

export function getSentimentFromScore(score: number | null): Sentiment {
    if (score === null) return 'neutral';
    if (score > 0.3) return 'positive';
    if (score > -0.3) return 'neutral';
    if (score > -0.6) return 'cautious';
    return 'negative';
}

export function getSentimentLabel(sentiment: Sentiment): string {
    const labels: Record<Sentiment, string> = {
        positive: 'Positiv',
        neutral: 'Neutral',
        cautious: 'Försiktig',
        negative: 'Negativ',
    };
    return labels[sentiment];
}

export function getSentimentColor(sentiment: Sentiment): string {
    const colors: Record<Sentiment, string> = {
        positive: '#10b981',
        neutral: '#6b7280',
        cautious: '#f59e0b',
        negative: '#ef4444',
    };
    return colors[sentiment];
}
