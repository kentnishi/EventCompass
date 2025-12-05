import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServer();

  try {
    const { data: survey, error: surveyErr } = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (surveyErr) throw surveyErr;
    if (!survey) return NextResponse.json([], { status: 200 });

    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .or("code.eq.qid39,text.ilike.%What year are you%")
      .limit(1)
      .maybeSingle();

    if (qErr) throw qErr;
    if (!question) return NextResponse.json([], { status: 200 });

    const { data: answers, error: aErr } = await supabase
      .from("survey_answer")
      .select("value_text")
      .eq("question_id", question.id);

    if (aErr) throw aErr;

    const buckets: Record<string, number> = {};

    for (const row of answers ?? []) {
      const raw = (row.value_text ?? "").toString().trim();
      if (!raw) continue;

      const label = normalizeYear(raw);
      if (!label) continue;

      buckets[label] = (buckets[label] ?? 0) + 1;
    }

    const total = Object.values(buckets).reduce((s, c) => s + c, 0);

    const orderedLabels = [
      "First-year",
      "Sophomore",
      "Junior",
      "Senior",
      "Graduate / Professional",
      "Other / Non-degree",
    ];

    const result = orderedLabels
      .filter((label) => buckets[label] != null)
      .map((label) => ({
        label,
        count: buckets[label],
        percent: total ? (buckets[label] / total) * 100 : 0,
      }));

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("demographics/year error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// normalization
function normalizeYear(input: string): string | null {
  const s = input.toLowerCase().trim();
  if (!s) return null;

  if (s.includes("freshman") || s.includes("first") || s.includes("1st") || s === "1") {
    return "First-year";
  }

  if (s.includes("sophomore") || s.includes("second") || s.includes("2nd") || s === "2") {
    return "Sophomore";
  }

  if (s.includes("junior") || s.includes("third") || s.includes("3rd") || s === "3") {
    return "Junior";
  }

  if (s.includes("senior") || s.includes("fourth") || s.includes("4th") || s === "4") {
    return "Senior";
  }

  if (
    s.includes("grad") ||
    s.includes("graduate") ||
    s.includes("master") ||
    s.includes("phd") ||
    s.includes("professional")
  ) {
    return "Graduate / Professional";
  }

  return "Other / Non-degree";
}
