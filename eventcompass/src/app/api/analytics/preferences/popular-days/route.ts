// app/api/analytics/preferences/popular-days/route.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // avoid caching in dev

export async function GET() {
  try {
    // 0) latest survey id
    const s = await createServer()
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (s.error) throw s.error;
    if (!s.data) return NextResponse.json([], { status: 200 });
    const surveyId = s.data.id;

    // 1) find qid16 for that survey
    const q = await createServer()
      .from("survey_question")
      .select("id,qtype")
      .eq("survey_id", surveyId)
      .eq("code", "qid16")
      .limit(1)
      .single();
    if (q.error) throw q.error;
    if (!q.data) return NextResponse.json([], { status: 200 });

    // 2) pull answers (both json and text)
    const a = await createServer()
      .from("survey_answer")
      .select("value_json,value_text")
      .eq("question_id", q.data.id);
    if (a.error) throw a.error;

    // 3) aggregate in Node
    const counts = new Map<string, number>();
    for (const row of a.data ?? []) {
      // value_json (preferred)
      if (row.value_json && Array.isArray(row.value_json)) {
        for (const raw of row.value_json as string[]) {
          add(normalizeDay(raw), counts);
        }
      } else if (row.value_text) {
        // fallback: split delimited text
        const parts = String(row.value_text)
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const raw of parts) add(normalizeDay(raw), counts);
      }
    }

    // 4) format in weekday order
    const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const out = order.map((label) => ({
      label,
      cnt: counts.get(label) ?? 0,
    }));

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

function add(label: string, map: Map<string, number>) {
  map.set(label, (map.get(label) ?? 0) + 1);
}

function normalizeDay(input: string): string {
  const s = (input || "").trim().toLowerCase();
  if (s.startsWith("sun")) return "Sun";
  if (s.startsWith("mon")) return "Mon";
  if (s.startsWith("tue")) return "Tue";
  if (s.startsWith("wed")) return "Wed";
  if (s.startsWith("thu")) return "Thu";
  if (s.startsWith("fri")) return "Fri";
  if (s.startsWith("sat")) return "Sat";
  // numeric 0–6?
  if (/^\d+$/.test(s)) {
    const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return map[Number(s) % 7];
  }
  // unknown token: ignore by returning a bucketless sentinel (no-op)
  return "";
}
