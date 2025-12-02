import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = { response_id: string; value_json: unknown; value_text: string | null };

export async function GET() {
  try {
    // 1) latest survey
    const s = await createServer()
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (s.error || !s.data) return NextResponse.json([], { status: 200 });
    const surveyId = s.data.id;

    // 2) find qids for this survey
    const qs = await createServer()
      .from("survey_question")
      .select("id, code")
      .eq("survey_id", surveyId)
      .in("code", ["qid52", "qid52_3_text"]);
    if (qs.error) throw qs.error;

    const qid52 = qs.data?.find((q) => q.code === "qid52")?.id;
    const qid52Other = qs.data?.find((q) => q.code === "qid52_3_text")?.id;

    if (!qid52) {
      return NextResponse.json(
        { error: "qid52 not found for latest survey" },
        { status: 200 }
      );
    }

    // 3) fetch answers for both
    const [multiRes, otherRes] = await Promise.all([
      createServer()
        .from("survey_answer")
        .select("response_id,value_json,value_text")
        .eq("question_id", qid52),
      qid52Other
        ? createServer()
          .from("survey_answer")
          .select("response_id,value_text")
          .eq("question_id", qid52Other)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    if (multiRes.error) throw multiRes.error;
    if ((otherRes as { error: unknown }).error) throw (otherRes as { error: unknown }).error;

    const multi: Row[] = (multiRes.data ?? []) as Row[];
    const other = ((otherRes as { data: unknown }).data ?? []) as {
      response_id: string;
      value_text: string | null;
    }[];

    // 4) aggregate
    const counts = new Map<string, number>();
    const seen = new Set<string>(); // dedupe within (response, label)

    // helper to add one count per unique (response,label)
    const add = (responseId: string, raw: string) => {
      const label = normalizeDiet(raw);
      if (!label) return;
      const key = `${responseId}:${label}`;
      if (seen.has(key)) return;
      seen.add(key);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    };

    // 4a) multi-select answers (json array preferred; else split delimited text)
    for (const row of multi) {
      const toks: string[] = Array.isArray(row.value_json)
        ? (row.value_json as string[])
        : row.value_text
          ? String(row.value_text)
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter(Boolean)
          : [];
      for (const t of toks) add(row.response_id, t);
    }

    // 4b) “Other (please specify)” adds to Other bucket once per response
    const otherSeenResp = new Set<string>();
    for (const o of other) {
      const txt = (o.value_text || "").trim();
      if (!txt) continue;
      if (otherSeenResp.has(o.response_id)) continue; // one “Other” per response
      otherSeenResp.add(o.response_id);
      add(o.response_id, "other"); // folds into "Other"
    }

    // 5) preferred order for donut: Vegan, Vegetarian, Gluten-Free, Dairy-Free, Nut-Free, Halal, Kosher, Pescatarian, None, Other
    const order = [
      "Vegan",
      "Vegetarian",
      "Gluten-Free",
      "Dairy-Free",
      "Nut-Free",
      "Halal",
      "Kosher",
      "Pescatarian",
      "None",
      "Other",
    ];
    const out = Array.from(counts, ([label, cnt]) => ({ label, cnt }))
      // put known labels in our order; unknowns (if any) at the end
      .sort((a, b) => {
        const ia = order.indexOf(a.label);
        const ib = order.indexOf(b.label);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });

    return NextResponse.json(out, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json(
      { error: error?.message ?? String(e) },
      { status: 500 }
    );
  }
}

/** Map many synonyms into a small set of labels for charting */
function normalizeDiet(input: string): string {
  const s = (input || "").trim().toLowerCase();

  // none / no restriction
  if (
    /\bnone\b/.test(s) ||
    /no\s*(diet|restric|pref)/.test(s) ||
    /\bno\b/.test(s)
  )
    return "None";

  if (/vegan/.test(s)) return "Vegan";
  if (/veget/i.test(s) || /\bveg\b/.test(s)) return "Vegetarian";
  if (/pesc/i.test(s)) return "Pescatarian";

  if (/gluten|celiac/.test(s)) return "Gluten-Free";
  if (/lactose|dairy/.test(s)) return "Dairy-Free";

  if (/peanut|tree\s*nut|nut\s*allerg|nuts?[-\s]?free/.test(s)) return "Nut-Free";
  if (/shellfish|sea\s*food\s*allerg/i.test(s)) return "Nut-Free"; // fold to nut-free or make new "Shellfish-Free" if you prefer

  if (/halal/.test(s)) return "Halal";
  if (/kosher/.test(s)) return "Kosher";

  if (/other/.test(s)) return "Other";

  // unknown tokens: try to classify quickly by keywords
  if (/soy/.test(s)) return "Other";
  if (/egg/.test(s)) return "Other";

  // default: ignore (return empty) so we don’t muddy buckets
  return "";
}
