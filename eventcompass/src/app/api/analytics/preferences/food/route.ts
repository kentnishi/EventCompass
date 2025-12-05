import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = {
  label: string;
  cnt: number;
};

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

    // 2) qid50
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid50")
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

      const parts = String(raw)
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const labels = parts.length ? parts : [String(raw).trim()];

      for (const opt of labels) {
        const label = opt;
        if (!label) continue;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }

    const out: Bucket[] = Array.from(counts, ([label, cnt]) => ({
      label,
      cnt,
    })).sort((a, b) => b.cnt - a.cnt);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("preferences/food error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
