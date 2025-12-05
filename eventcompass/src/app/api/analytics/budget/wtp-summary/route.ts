import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type WtpPoint = {
  label: string;
  avg: number;
  median: number;
};

type QuestionMeta = {
  code: string;
  label: string;
};

const QUESTIONS: QuestionMeta[] = [
  { code: "qid10_5", label: "General Event" },
  { code: "qid10_1", label: "On-campus" },
  { code: "qid10_2", label: "Off-campus" },
  { code: "qid10_3", label: "Spring Break Trip" },
  { code: "qid10_4", label: "Fall Break Trip" },
];

// median helper
function median(values: number[]): number {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length - 1) / 2;
  if (arr.length % 2 === 1) {
    return arr[Math.round(mid)];
  }
  const i = arr.length / 2;
  return (arr[i - 1] + arr[i]) / 2;
}

// value_number -> fallback value_text parse
function toNumber(row: { value_number: number | null; value_text: string | null }): number | null {
  if (row.value_number != null) return row.value_number;
  if (row.value_text == null) return null;
  const n = Number(String(row.value_text).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const supabase = createServer();

  try {
    const { data: survey, error: surveyErr } = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (surveyErr || !survey) {
      return NextResponse.json<WtpPoint[]>([], { status: 200 });
    }

    const out: WtpPoint[] = [];

    for (const q of QUESTIONS) {
      const { data: question, error: qErr } = await supabase
        .from("survey_question")
        .select("id, code")
        .eq("survey_id", survey.id)
        .eq("code", q.code)
        .maybeSingle();

      if (qErr || !question) continue;

      const { data: answers, error: aErr } = await supabase
        .from("survey_answer")
        .select("value_number, value_text")
        .eq("question_id", question.id);

      if (aErr || !answers) continue;

      const nums: number[] = [];
      for (const row of answers) {
        const n = toNumber(row as any);
        if (n == null) continue;
        if (!Number.isFinite(n)) continue;
        if (n < 0) continue;
        nums.push(n);
      }

      if (!nums.length) {
        out.push({ label: q.label, avg: 0, median: 0 });
        continue;
      }

      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = sum / nums.length;
      const med = median(nums);

      out.push({
        label: q.label,
        avg: Number(avg.toFixed(2)),
        median: Number(med.toFixed(2)),
      });
    }

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("budget/wtp-summary error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
