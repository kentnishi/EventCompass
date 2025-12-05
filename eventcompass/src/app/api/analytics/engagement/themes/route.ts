import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Bucket = { label: string; count: number };

/**
 * qid27_text: "What helps you feel more connected to the campus community?"
 */
function normalizeTheme(raw: string | null): string | null {
  if (!raw) return null;

  let s = raw.trim();
  if (!s) return null;
  s = s.replace(/\s+/g, " ");
  const lower = s.toLowerCase();

  // 1) N/A / none
  if (
    /^na$/.test(lower) ||
    /^n\/a$/.test(lower) ||
    /^no$/.test(lower) ||
    /^none$/.test(lower) ||
    /^idk$/.test(lower) ||
    /nothing in particular/.test(lower) ||
    /not really sure/.test(lower) ||
    /truthfully im fine/.test(lower)
  ) {
    return null;
  }

  // 2) Cultural / identity / diversity
  if (
    /cultural|culture|heritage|identity|diversity|representation|backgrounds?|international/.test(
      lower,
    )
  ) {
    return "Cultural / identity events";
  }

  // 3) Food + freebies + merch
  if (
    /food|snack|snacks|pizza|boba|bubble tea|coffee|meal|dinner|legos/.test(
      lower,
    ) ||
    /free stuff|free events?|free things/.test(lower) ||
    /giveaway|giveaways/.test(lower) ||
    /merch(andise)?|school merch/.test(lower)
  ) {
    return "Food, merch & free stuff";
  }

  // 4) Big campus events / school spirit
  if (
    /large events?|largescale|big events?|big campus events?/.test(lower) ||
    /campuswide/.test(lower) ||
    /springfest/.test(lower) ||
    /concerts?/.test(lower) ||
    /festival|carnival/.test(lower) ||
    /hundreds of people/.test(lower) ||
    /school spirit|campus spirit/.test(lower)
  ) {
    return "Large campus events & school spirit";
  }

  // 5) Smaller / chill / not overwhelming events
  if (
    /small group events?|small events?/.test(lower) ||
    /chill|low[- ]?key|relax(ed)?/.test(lower) ||
    /easygoing events?/.test(lower) ||
    /not be overwhelmed|not too crowded or loud|lost in the crowd/.test(lower)
  ) {
    return "Smaller / chill events";
  }

  // 6) Friends / social connections / shared experiences
  if (
    /friend(s)?/.test(lower) ||
    /social(izing|ization)?/.test(lower) ||
    /meeting new people|meet new people|meeting more ppl|meeting more people/.test(
      lower,
    ) ||
    /meeting people|meet people/.test(lower) ||
    /talking to people|talking to other students|talking to new people/.test(
      lower,
    ) ||
    /shared experiences|shared hatred/.test(lower) ||
    /people coming together|everyone enjoying each others company/.test(lower) ||
    /group events?|group experiences/.test(lower) ||
    /being with people (who know me|i know)/.test(lower)
  ) {
    return "Friends / social connections";
  }

  // 7) Clubs / involvement / UPB / jobs
  if (
    /club(s)?/.test(lower) ||
    /getting involved|involvement/.test(lower) ||
    /participating in events?|participation/.test(lower) ||
    /planning an event/.test(lower) ||
    /campus jobs?/.test(lower) ||
    /upb/.test(lower) ||
    /board that helps plan/.test(lower) ||
    /executive members/.test(lower)
  ) {
    return "Clubs, UPB & getting involved";
  }

  // 8) Feeling welcome / belonging / safe
  if (
    /feel(ing)? welcome/.test(lower) ||
    /welcoming people|welcoming to the community/.test(lower) ||
    /sense of belonging/.test(lower) ||
    /being included|inclusion|inclusive|inclusivity/.test(lower) ||
    /comfortable environment|feel safe/.test(lower)
  ) {
    return "Welcoming & sense of belonging";
  }

  // 9) "Just going to events"
  if (
    /going to events?|goin to events?/.test(lower) ||
    /^events?$/.test(lower) ||
    /attending (the )?events?/.test(lower) ||
    /eventa/.test(lower) ||
    /campus events/.test(lower) ||
    /more events in general|more events$/.test(lower)
  ) {
    return "Attending campus events in general";
  }

  // 10) Communication / info
  if (
    /lots of updates on upcoming events/.test(lower) ||
    /being on top of all the events going on/.test(lower) ||
    /communication/.test(lower) ||
    /social media/.test(lower)
  ) {
    return "Communication & staying informed";
  }

  // 11) Catch-all "Other / mixed"
  return "Other";
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
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    const { data: question, error: qErr } = await supabase
      .from("survey_question")
      .select("id, code, text")
      .eq("survey_id", survey.id)
      .eq("code", "qid27_text")
      .maybeSingle();

    if (qErr || !question) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    const { data: answers, error: aErr } = await supabase
      .from("survey_answer")
      .select("value_text")
      .eq("question_id", question.id);

    if (aErr || !answers) {
      return NextResponse.json<Bucket[]>([], { status: 200 });
    }

    const counts = new Map<string, number>();

    for (const row of answers) {
      const label = normalizeTheme((row as any).value_text ?? null);
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const out: Bucket[] = Array.from(counts, ([label, count]) => ({
      label,
      count,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("engagement/themes error", e);
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
