/**
 * Uppdaterar companies-tabellen i Supabase med ISIN och företagsbeskrivning
 * från NGM_Bolag.xlsx
 * 
 * OBS: Kör först i Supabase SQL Editor:
 *   ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS isin text;
 */
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const wb = XLSX.readFile('/Users/l1fr11s/Downloads/NGM_Bolag.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`📊 Läser ${rows.length} bolag från xlsx...\n`);

// Hämta alla companies från Supabase
const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, slug, ticker');

if (error) { console.error('Fel vid hämtning:', error); process.exit(1); }
console.log(`🏢 ${companies.length} bolag i Supabase\n`);

// Normalisera namn för matching
function norm(s) {
    return s?.toLowerCase()
        .replace(/\s*(ab|publ|group|holding)\s*/gi, ' ')
        .replace(/[^a-zåäö0-9]/g, '')
        .trim();
}

// Kolla om isin-kolumnen finns
const { error: isinTest } = await supabase.from('companies').update({ isin: 'TEST' }).eq('id', 'nonexistent');
const hasIsin = !isinTest || !isinTest.message?.includes('isin');
console.log(`ISIN-kolumn finns: ${hasIsin ? 'ja' : 'nej – kör ALTER TABLE först'}\n`);

let updated = 0;
let notFound = [];

for (const row of rows) {
    const xlsName = row['Bolagsnamn'];
    const isin = row['ISIN'];
    const desc = row['Företagspresentation'];
    const symbol = row['Symbol'];

    if (!xlsName) continue;

    // Matcha: exakt namn, normaliserat namn, ticker/symbol, eller fuzzy
    let match = companies.find(c => c.name === xlsName);
    if (!match) match = companies.find(c => norm(c.name) === norm(xlsName));
    if (!match) match = companies.find(c => c.ticker === symbol);
    if (!match) {
        match = companies.find(c =>
            norm(c.name)?.includes(norm(xlsName)) ||
            norm(xlsName)?.includes(norm(c.name))
        );
    }

    if (!match) {
        notFound.push(`${xlsName} (${symbol})`);
        continue;
    }

    const updateData = {};
    if (desc) updateData.description = desc;
    if (isin && hasIsin) updateData.isin = isin;

    if (Object.keys(updateData).length === 0) continue;

    const { error: updateErr } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', match.id);

    if (updateErr) {
        console.error(`❌ ${xlsName}: ${updateErr.message}`);
    } else {
        updated++;
        console.log(`✅ ${xlsName} → ${match.name}${isin ? ` (ISIN: ${isin})` : ''}`);
    }
}

console.log(`\n📈 Uppdaterade: ${updated}/${rows.length}`);
if (notFound.length > 0) {
    console.log(`\n⚠️ Ej matchade (${notFound.length}):`);
    notFound.forEach(n => console.log(`  - ${n}`));
}
