// Steg 1: Återställ alla rss_feed_url som felaktigt sattes till "valuno"
// Kör med: node fix-valuno.mjs

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://pwfznjcdrauvjyhjncew.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZnpuamNkcmF1dmp5aGpuY2V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk5NDA3MSwiZXhwIjoyMDg4NTcwMDcxfQ.2Y-MasloUkJSd9CelIBYWbN3dT5Ds74Gayc9rqp3z2Q"
);

const { data, error } = await supabase
    .from("companies")
    .update({ rss_feed_url: null })
    .eq("rss_feed_url", "valuno")
    .select("name");

if (error) {
    console.error("Fel:", error.message);
} else {
    console.log(`Återställde ${data?.length ?? 0} bolag (raderade felaktig 'valuno'-slug):`);
    data?.forEach(c => console.log("  -", c.name));
}
