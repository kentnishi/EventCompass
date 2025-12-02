import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // latest survey id
  const s = await supabase.from("survey").select("id").order("created_at", { ascending: false }).limit(1).single();
  if (s.error || !s.data) return NextResponse.json([], { status: 200 });

  // qid17
  const q = await supabase
    .from("survey_question")
    .select("id")
    .eq("survey_id", s.data.id)
    .eq("code", "qid17")
    .limit(1)
    .single();
  if (q.error || !q.data) return NextResponse.json([], { status: 200 });

  const a = await supabase
    .from("survey_answer")
    .select("response_id, value_json, value_text")
    .eq("question_id", q.data.id);

  if (a.error) return NextResponse.json({ error: a.error.message }, { status: 500 });

  // aggregate
  const seen = new Set<string>(); // dedupe within (response,bucket)
  const counts = new Map<string, number>();

  const tokens = (row: any): string[] => {
    if (Array.isArray(row.value_json)) return row.value_json;
    if (row.value_text) return String(row.value_text).split(/[;,|]/).map((s) => s.trim()).filter(Boolean);
    return [];
  };

  for (const row of a.data ?? []) {
    for (const tok of tokens(row)) {
      const mins = parseTime(tok);
      if (mins == null) continue;
      const bucket = bucketLabel(mins);
      const key = `${row.response_id}:${bucket}`;
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
  }

  // stable order by time-of-day
  const order = (b: string) => hhmm(b);
  const out = Array.from(counts, ([bucket, cnt]) => ({ label: bucket, cnt }))
    .sort((a, b) => order(a.label) - order(b.label));

  return NextResponse.json(out);
}

/* helpers */
function parseTime(s0: string): number | null {
  const s = s0.trim().toLowerCase();
  if (!s) return null;
  if (/\bmorn/.test(s)) return 9 * 60;
  if (/\bnoon/.test(s)) return 12 * 60;
  if (/\bafter/.test(s)) return 15 * 60;
  if (/\beven/.test(s)) return 19 * 60;
  if (/\bnight/.test(s)) return 22 * 60;
  if (/\bmidnight\b/.test(s)) return 0;

  // range: "5-7 pm" / "5–7pm" -> midpoint
  let m = s.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (m) {
    let [ , h1, m1, h2, m2, ap ] = m;
    let H1 = to24(parseInt(h1,10), ap), M1 = parseInt(m1||"0",10);
    let H2 = to24(parseInt(h2,10), ap), M2 = parseInt(m2||"0",10);
    return Math.round(((H1*60+M1)+(H2*60+M2))/2);
  }
  // 5:30 pm
  m = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (m) { let H=to24(parseInt(m[1],10), m[3]), M=parseInt(m[2],10); return H*60+M; }
  // 5 pm
  m = s.match(/^(\d{1,2})\s*(am|pm)$/);
  if (m) { let H=to24(parseInt(m[1],10), m[2]); return H*60; }
  // 17:30
  m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) { let H=parseInt(m[1],10), M=parseInt(m[2],10); if (H>=0&&H<=23) return H*60+M; }
  // 17
  m = s.match(/^(\d{1,2})$/);
  if (m) { let H=parseInt(m[1],10); if (H>=0&&H<=23) return H*60; }
  return null;
}
function to24(h: number, ap?: string) { if (!ap) return h%24; ap=ap.toLowerCase(); if (ap==='pm'&&h<12) return h+12; if (ap==='am'&&h===12) return 0; return h%24; }
function bucketLabel(mins: number) { const hr = Math.floor(mins/60)%24; const start = Math.floor(hr/2)*2; return fmt(start)+'–'+fmt((start+2)%24); }
function fmt(h: number) { const d = new Date(); d.setHours(h,0,0,0); return d.toLocaleTimeString('en-US',{hour:'numeric',hour12:true}).replace(':00','').toUpperCase(); }
function hhmm(bucket: string) {
  const m = bucket.match(/^(\d{1,2})(AM|PM)/i); if (!m) return 0;
  let h = parseInt(m[1],10); const ap=m[2].toUpperCase(); if (ap==='PM'&&h<12) h+=12; if (ap==='AM'&&h===12) h=0; return h*100;
}
