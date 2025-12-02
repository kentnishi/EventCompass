import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabase";

export const dynamic = "force-dynamic";

type MultiRow = { response_id: string; value_json: any; value_text: string | null };
type OtherRow = { response_id: string; value_text: string | null };

export async function GET() {
  try {
    // 1) latest survey
    const s = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (s.error || !s.data) return NextResponse.json([], { status: 200 });
    const surveyId = s.data.id;

    // 2) find the question ids by label text (robust to code changes)
    const findQ = async (needle: string) =>
      supabase
        .from("survey_question")
        .select("id, text")
        .eq("survey_id", surveyId)
        .ilike("text", `%${needle}%`)
        .limit(1)
        .maybeSingle();

    const selectedQ = await findQ(
      "Which types of events would you most like to see again or see more of%Selected Choice%"
    );
    const otherQ = await findQ(
      "Which types of events would you most like to see again or see more of%Other%Text%"
    );

    if (selectedQ.error) throw selectedQ.error;
    if (!selectedQ.data) {
      return NextResponse.json(
        { error: "Themes question (Selected Choice) not found in latest survey." },
        { status: 200 }
      );
    }

    // 3) fetch answers
    const [multiRes, otherRes] = await Promise.all([
      supabase
        .from("survey_answer")
        .select("response_id,value_json,value_text")
        .eq("question_id", selectedQ.data.id),
      otherQ.data
        ? supabase
            .from("survey_answer")
            .select("response_id,value_text")
            .eq("question_id", otherQ.data.id)
        : Promise.resolve({ data: [] as OtherRow[], error: null }),
    ]);

    if (multiRes.error) throw multiRes.error;
    if ((otherRes as any).error) throw (otherRes as any).error;

    const multi: MultiRow[] = (multiRes.data ?? []) as MultiRow[];
    const other: OtherRow[] = ((otherRes as any).data ?? []) as OtherRow[];

    // 4) aggregate
    const counts = new Map<string, number>();
    const seen = new Set<string>(); // dedupe within (response, label)

    const add = (responseId: string, raw: string) => {
      const label = normalizeTheme(raw);
      if (!label) return;
      const key = `${responseId}:${label}`;
      if (seen.has(key)) return;
      seen.add(key);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    };

    // multi-select values (JSON array preferred; else split text)
    for (const row of multi) {
      const tokens: string[] = Array.isArray(row.value_json)
        ? (row.value_json as string[])
        : row.value_text
        ? String(row.value_text)
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      for (const t of tokens) add(row.response_id, t);
    }

    // fold “Other – Text” into Other (once per response)
    const otherSeen = new Set<string>();
    for (const o of other) {
      const txt = (o.value_text || "").trim();
      if (!txt) continue;
      if (otherSeen.has(o.response_id)) continue;
      otherSeen.add(o.response_id);
      add(o.response_id, "other");
    }

    // 5) format output (known tags first, then any unknowns)
    const order = [
      "Free",
      "Merch",
      "Video Games",
      "Movie",
      "Concert/Music",
      "Trivia/Game Night",
      "Casino/Gambling",
      "Sports",
      "Arts & Crafts / DIY",
      "Outdoor/Trips",
      "Cultural",
      "Speaker/Talk",
      "Wellness",
      "Academic/Career",
      "Volunteering/Service",
      "Dance/Party",
      "Food",
      "Other",
    ];
    const result = Array.from(counts, ([label, cnt]) => ({ label, cnt }))
      .sort((a, b) => {
        const ia = order.indexOf(a.label);
        const ib = order.indexOf(b.label);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || b.cnt - a.cnt;
      });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}

/** Map raw tokens to a tidy theme set */
function normalizeTheme(input: string): string {
  const s = (input || "").trim().toLowerCase();

  // high-signal tags from your UI
  if (/^free\b|free\s?event|no\s*cost|$0/.test(s)) return "Free";
  if (/merch|swag|giveaway|prize|raffle/.test(s)) return "Merch";
  if (/video\s*game|gaming|lan|esports?/.test(s)) return "Video Games";
  if (/movie|film|cinema|screening/.test(s)) return "Movie";
  if (/concert|music|dj|band|live\s*music|open\s*mic/.test(s)) return "Concert/Music";
  if (/trivia|quiz|kahoot|game\s*night/.test(s)) return "Trivia/Game Night";
  if (/casino|poker|blackjack|gambl/.test(s)) return "Casino/Gambling";
  if (/sport|basketball|football|soccer|intramural|watch\s*party/.test(s)) return "Sports";
  if (/craft|diy|paint|art\s*night|ceramic|pottery|tie[-\s]*dye/.test(s)) return "Arts & Crafts / DIY";
  if (/hike|outdoor|trip|excursion|ski|kayak|camp|park|museum\s*trip/.test(s)) return "Outdoor/Trips";
  if (/cultur|heritage|holiday|festival|celebration|identity|affinity|intl|international/.test(s)) return "Cultural";
  if (/speaker|talk|panel|lecture|fireside/.test(s)) return "Speaker/Talk";
  if (/wellness|mental|yoga|meditat|fitness|health/.test(s)) return "Wellness";
  if (/career|network|recruit|resume|professional|alumni/.test(s)) return "Academic/Career";
  if (/volunteer|service|philanthropy|charity|community/.test(s)) return "Volunteering/Service";
  if (/dance|party|formal|ball|silent\s*disco/.test(s)) return "Dance/Party";
  if (/food|snack|boba|bbq|cookout|tasting|bake\s*off/.test(s)) return "Food";

  if (/other/.test(s)) return "Other";
  return ""; // ignore unknowns rather than polluting the chart
}
