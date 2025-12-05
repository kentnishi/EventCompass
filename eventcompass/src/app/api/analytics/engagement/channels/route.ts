import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

function normalizeChannel(raw: string): string | null {
  let s = raw.toLowerCase().trim();
  if (!s) return null;

  // in case of having quotes or extra spaces
  s = s.replace(/[“”"']/g, "").replace(/\s+/g, " ");

  if (/instagram|insta/.test(s)) return "Instagram";
  if (/email|mail/.test(s)) return "Email";
  if (/campus ?groups?/.test(s)) return "CampusGroups";
  if (/poster|flyer|sign|banner/.test(s)) return "Posters / Flyers";
  if (/friend|word of mouth|mouth/.test(s)) return "Friends / word of mouth";
  if (/website|site|web/.test(s)) return "UPB / CWRU website";
  if (/discord/.test(s)) return "Discord";
  if (/groupme/.test(s)) return "GroupMe";

  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  const supabase = createServer();

  try {
    // 1) latest survey
    const { data: survey, error: surveyErr } = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 2) qid21
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid21")
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
      const raw = (row as any).value_text ?? "";
      if (!raw) continue;

      // if multi-select "Instagram; Email" then split
      const parts = String(raw)
        .split(/[;,]/)
        .map((p) => p.trim())
        .filter(Boolean);

      const labels = parts.length ? parts : [String(raw).trim()];

      for (const p of labels) {
        const label = normalizeChannel(p);
        if (!label) continue;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("engagement/channels error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
