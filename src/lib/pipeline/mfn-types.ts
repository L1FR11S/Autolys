/* ===== MFN.se JSON API Types ===== */

export interface MfnFeedResponse {
    version: string;
    title: string;
    home_page_url: string;
    feed_url: string;
    next_url?: string;
    items: MfnItem[];
}

export interface MfnItem {
    id: string;
    url: string;
    author: MfnAuthor;
    subjects: MfnAuthor[];
    properties: MfnProperties;
    content: MfnContent;
    extensions: Record<string, unknown>;
    source: string;
}

export interface MfnAuthor {
    entity_id: string;
    slug: string;
    slugs: string[];
    name: string;
    isins: string[];
    leis: string[];
    local_refs: string[];
    tickers: string[];
}

export interface MfnProperties {
    lang: string;
    tags: string[];     // e.g. [":regulatory", "sub:report", "sub:report:interim"]
    type: string;       // e.g. "ir"
    scopes: string[];   // e.g. ["SE"]
}

export interface MfnContent {
    title: string;
    slug: string;
    publish_date: string;  // ISO 8601
    preamble: string;
    html: string;
    text: string;
    attachments: MfnAttachment[];
}

export interface MfnAttachment {
    file_title: string;
    content_type: string;
    url: string;
    tags: string[];
}
