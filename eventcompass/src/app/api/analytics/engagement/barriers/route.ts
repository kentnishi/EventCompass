import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

function normalizeBarrier(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  const lower = s.toLowerCase();

  if (lower.startsWith("other")) return "Other";

  if (lower.startsWith("didn’t hear") || lower.startsWith("didn't hear")) {
    return "Didn’t hear about it";
  }
  if (lower.startsWith("bad timing")) return "Bad timing";
  if (lower.startsWith("too crowded")) return "Too crowded";
  if (lower.startsWith("required registration")) return "Required registration";
  if (lower.startsWith("event cost")) return "Event cost";
  if (lower.startsWith("didn’t interest") || lower.startsWith("didn't interest")) {
    return "Didn’t interest me";
  }
  if (lower.startsWith("travel time")) return "Travel time";
  if (lower.startsWith("have beef")) return "Have beef with UPB";

  return s.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  const supabase = createServer();

  try {
    // 1) lastest survey
    const { data: survey, error: surveyErr } = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 2) qid7
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid7")
      .maybeSingle();

    if (qErr || !question) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 3) responses
    const { data: answers, error: aErr } = await supabase
      .from("survey_answer")
      .select("value_text")
      .eq("question_id", question.id);

    if (aErr || !answers) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    const counts = new Map<string, number>();

    for (const row of answers) {
      const raw = (row as any).value_text as string | null;
      if (!raw) continue;

      const parts = raw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      for (const part of parts) {
        const label = normalizeBarrier(part);
        if (!label) continue;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("engagement/barriers error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
