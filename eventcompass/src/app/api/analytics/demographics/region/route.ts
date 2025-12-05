// app/api/analytics/demographics/region/route.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

// free-text "Where are you from?" → Ohio / Popular States / US - Other States / International
function normalizeRegion(raw: string): string | null {
  if (!raw) return null;
  let s = raw.toLowerCase().trim();
  if (!s) return null;

  // 구두점 / 슬래시 / 콤마 제거 후 스페이스 normalize
  s = s
    .replace(/[“”"']/g, " ")
    .replace(/[,/]+/g, " ")
    .replace(/\s+/g, " ");

  if (!s) return null;

  const POPULAR_STATES = [
    { abbr: "CA", name: "california" },
    { abbr: "NY", name: "new york" },
    { abbr: "TX", name: "texas" },
    { abbr: "FL", name: "florida" },
  ];

  const ALL_STATES = [
    "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
    "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
    "louisiana","maine","maryland","massachusetts","michigan","minnesota",
    "mississippi","missouri","montana","nebraska","nevada","new hampshire",
    "new jersey","new mexico","new york","north carolina","north dakota","ohio","oklahoma",
    "oregon","pennsylvania","rhode island","south carolina","south dakota",
    "tennessee","texas","utah","vermont","virginia","washington","west virginia",
    "wisconsin","wyoming",
  ];

  const ALL_ABBR = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
    "WI","WY",
  ];

  // 1) Ohio는 메인이라 가장 먼저 체크
  if (/\bohio\b|\boh\b/.test(s)) return "Ohio";

  // 2) Popular states: CA, NY, TX, FL → 각각 이름으로 보여주기
  for (const st of POPULAR_STATES) {
    const abbr = st.abbr.toLowerCase();
    const name = st.name;

    if (new RegExp(`\\b${abbr}\\b`).test(s)) {
      // "california" → "California"
      return st.name.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (new RegExp(`\\b${name}\\b`).test(s)) {
      return st.name.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // 3) 나머지 모든 미국 주가 등장하면 → US - Other States
  for (const name of ALL_STATES) {
    if (name === "ohio") continue; // 이미 위에서 처리
    if (POPULAR_STATES.some((p) => p.name === name)) continue;

    if (new RegExp(`\\b${name}\\b`).test(s)) return "US - Other States";
  }

  for (const abbr of ALL_ABBR) {
    if (abbr === "OH") continue;
    if (POPULAR_STATES.some((p) => p.abbr === abbr)) continue;

    const ab = abbr.toLowerCase();
    if (new RegExp(`\\b${ab}\\b`).test(s)) return "US - Other States";
  }

  // 4) 미국 주 이름은 없지만 USA만 써놓은 경우
  if (/united states|u\.s\.a|usa|\bus\b/.test(s)) {
    return "US - Other States";
  }

  // 5) 나머지는 International
  return "International / Other";
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

    // 2) "Where are you from" 질문 찾기 (code 기준)
    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid41_text") // 필요하면 .or(...) 로 fallback 추가 가능
      .maybeSingle();

    if (qErr || !question) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    // 3) 응답 불러오기
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
      const label = normalizeRegion(String(raw));
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("demographics/region error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
