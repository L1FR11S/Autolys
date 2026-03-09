/**
 * ULTRA V3 – 1 PR per anrop men ALL analys i ETT anrop, 50 parallella, 0 paus
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const KEY = process.env.ANTHROPIC_API_KEY;

async function claude(sys, usr) {
    for (let i = 0; i < 3; i++) {
        try {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1200, system: sys, messages: [{ role: 'user', content: usr }] }),
            });
            if (r.status === 429) { await new Promise(r => setTimeout(r, 3000 * (i + 1))); continue; }
            if (!r.ok) return null;
            const d = await r.json();
            const t = d.content?.[0]?.text;
            const m = t?.match(/\{[\s\S]*\}/);
            return m ? JSON.parse(m[0]) : null;
        } catch { }
    }
    return null;
}

const ALL_IN_ONE = `Analysera detta pressmeddelande. Svara med ETT JSON-objekt:
{"summary":"2 meningar svenska","sentiment_score":0.5,"key_takeaways":["..."],"takeaways":[{"text":"...","type":"positive"}],"datapunkter":[{"label":"...","value":"..."}],"relevance":5,"triggers":{"positiva":[{"trigger":"...","tröskel":"..."}],"negativa":[{"trigger":"...","tröskel":"..."}]},"kpis":[{"namn":"...","värde":"...","period":"..."}]}
Var extremt koncis. Max 3 takeaways, 3 datapunkter, 2 triggers per typ, 5 kpis.`;

const GEO_MGMT = `Analysera bolagets geografi och ledningscitat. Svara med JSON:
{"geo":{"regions":[{"region":"...","exposure":"high/medium/low"}],"primary_market":"...","risks":["..."]},"mgmt":{"quotes":[{"person":"...","title":"...","quote":"..."}]}}`;

// Paginera Supabase
async function fetchAll(table, select, filter) {
    let all = [], offset = 0;
    while (true) {
        let q = supabase.from(table).select(select).range(offset, offset + 999);
        if (filter) q = filter(q);
        const { data } = await q;
        if (!data || data.length === 0) break;
        all.push(...data);
        offset += data.length;
        if (data.length < 1000) break;
    }
    return all;
}

// ===== MAIN =====
const allPRs = await fetchAll('press_releases', 'id, company_id, title, content', q => q.is('ai_summary', null));
const companies = await fetchAll('companies', 'id, name', q => q.is('geographic_exposure', null));
console.log(`📰 ${allPRs.length} PRs | 🏢 ${companies.length} bolag utan geo\n`);

// STEG 1: PRs – 10 parallella, 0 paus
console.log('=== PRs (10 parallella) ===');
let ok = 0, fail = 0;
for (let i = 0; i < allPRs.length; i += 10) {
    const batch = allPRs.slice(i, i + 10);
    await Promise.all(batch.map(async (pr) => {
        const text = `${pr.title}\n\n${(pr.content || '').slice(0, 2000)}`;
        const r = await claude(ALL_IN_ONE, text);
        if (!r) { fail++; return; }
        const { error } = await supabase.from('press_releases').update({
            ai_summary: r.summary, sentiment_score: r.sentiment_score, key_takeaways: r.key_takeaways,
            takeaways: r.takeaways, datapunkter: r.datapunkter, relevance: r.relevance,
            triggers: r.triggers, kpis: r.kpis,
            processed_at: new Date().toISOString(), analyzed_at: new Date().toISOString(),
        }).eq('id', pr.id);
        error ? fail++ : ok++;
    }));
    process.stdout.write(`\r  ${ok + fail}/${allPRs.length} (${ok}✅ ${fail}❌)`);
    await new Promise(r => setTimeout(r, 2000));
}
console.log(`\n  PRs: ${ok}✅ ${fail}❌\n`);

// STEG 2: Geo+Mgmt – 50 parallella
// STEG 2: Geo+Mgmt – 10 parallella
console.log('=== GEO+MGMT (10 parallella) ===');
const allPRsFull = await fetchAll('press_releases', 'company_id, title, content');
const map = {};
allPRsFull.forEach(p => { if (!map[p.company_id]) map[p.company_id] = []; map[p.company_id].push(p); });

let gOk = 0, gFail = 0;
for (let i = 0; i < companies.length; i += 10) {
    const batch = companies.slice(i, i + 10);
    await Promise.all(batch.map(async (c) => {
        const prs = map[c.id] || [];
        if (!prs.length) { gFail++; return; }
        const text = `Bolag: ${c.name}\n\n${prs.slice(0, 3).map(p => `${p.title}\n${(p.content || '').slice(0, 500)}`).join('\n---\n')}`;
        const r = await claude(GEO_MGMT, text);
        if (!r) { gFail++; return; }
        const upd = {};
        if (r.geo) upd.geographic_exposure = r.geo;
        if (r.mgmt) upd.management_comments = r.mgmt;
        if (!Object.keys(upd).length) { gFail++; return; }
        const { error } = await supabase.from('companies').update(upd).eq('id', c.id);
        error ? gFail++ : gOk++;
    }));
    process.stdout.write(`\r  ${gOk + gFail}/${companies.length} (${gOk}✅ ${gFail}❌)`);
    await new Promise(r => setTimeout(r, 2000));
}
console.log(`\n  Geo+Mgmt: ${gOk}✅ ${gFail}❌\n`);

console.log('🎉 KLAR!');
