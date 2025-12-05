// app/api/analytics/demographics/major/route.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

// free-text 전공을 broad category 로 매핑
function normalizeMajor(raw: string): string | null {
  let s = raw.toLowerCase().trim();
  if (!s) return null;

  // 특수문자 정리
  s = s.replace(/[“”"']/g, "").replace(/\s+/g, " ");

  if (/statistics|statistic/.test(s))
    return "Statistics";
  if (/computer|software|cs|comp sci|information systems|informatics|data science|data\s+analytics/.test(s))
    return "Computer / Data Science";
  if (/engineering|biomed|mechanical|electrical|civil|chemical/.test(s))
    return "Engineering";
  if (/business|accounting|finance|marketing|management|econ|economics/.test(s))
    return "Business / Economics";
  if (/biology|biochem|neuroscience|chemistry|physics|math|geology/.test(s))
    return "Natural Sciences";
  if (/psychology|sociology|anthropology|political|international relations|history|philosophy|english|literature|languages|history/.test(s))
    return "Social Sciences / Humanities";
  if (/nursing|pre\-med|pre med|public health|nutrition/.test(s))
    return "Health / Nursing / Pre-med";
  if (/art|design|music|theater|film|dance|studio/.test(s))
    return "Arts / Design";
  if (/undeclared|undecided/.test(s)) return "Undeclared";
  return "Other / Mixed";
}

export async function GET() {
  const supabase = createServer();

  try {
    // 1) 최신 설문
    const { data: survey, error: surveyErr } = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 2) "Major/Area of study" 질문 찾기
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id,text")
      .eq("survey_id", survey.id)
      .ilike("text", "%Major/Area of study%")
      .limit(1)
      .maybeSingle();

    if (qErr || !question) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 3) 응답 불러오기 (free-text)
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
      const label = normalizeMajor(String(raw));
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("demographics/major error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
