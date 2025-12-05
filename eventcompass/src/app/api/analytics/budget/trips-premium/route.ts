import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TripRow = {
  label: string; // "Yes", "No", "Unsure"
  count: number;
};

function normalizeAnswer(raw: string | null): "Yes" | "No" | "Unsure" | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();

  if (s.startsWith("yes") || s.includes("would be willing")) return "Yes";
  if (s.startsWith("no") || s.includes("not willing")) return "No";
  if (s.includes("unsure") || s.includes("not sure") || s.includes("maybe")) return "Unsure";

  return "Unsure";
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
      return NextResponse.json<TripRow[]>([], { status: 200 });
    }

    // 2) qid13
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid13")
      .maybeSingle();

    if (qErr || !question) {
      return NextResponse.json<TripRow[]>([], { status: 200 });
    }

    // 3) responses
    const { data: answers, error: aErr } = await supabase
      .from("survey_answer")
      .select("value_text")
      .eq("question_id", question.id);

    if (aErr || !answers) {
      return NextResponse.json<TripRow[]>([], { status: 200 });
    }

    const counts = new Map<"Yes" | "No" | "Unsure", number>([
      ["Yes", 0],
      ["No", 0],
      ["Unsure", 0],
    ]);

    for (const row of answers) {
      const cat = normalizeAnswer((row as any).value_text ?? null);
      if (!cat) continue;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }

    const out: TripRow[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    }));

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("budget/trips-premium error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
