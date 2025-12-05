import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

function normalizeWelcoming(raw: string | null): "Yes" | "Somewhat" | "No" | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();

  if (/strongly agree|agree|yes|very welcoming/.test(s)) return "Yes";
  if (/strongly disagree|disagree|no|not welcoming/.test(s)) return "No";
  if (/somewhat|neutral|not sure|unsure|mixed/.test(s)) return "Somewhat";

  // 기타 애매한 건 일단 Somewhat로 몰아도 되고 null 처리도 가능
  return "Somewhat";
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

    // 2) qid23
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid23")
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

    const counts = new Map<"Yes" | "Somewhat" | "No", number>([
      ["Yes", 0],
      ["Somewhat", 0],
      ["No", 0],
    ]);

    for (const row of answers) {
      const cat = normalizeWelcoming((row as any).value_text ?? null);
      if (!cat) continue;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    }));

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("engagement/welcoming error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
