import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

function nowPartsUTC() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);   // YYYY-MM-DD (UTC)
  const nowTime = now.toISOString().slice(11, 19); // HH:MM:SS (UTC)
  return { today, nowTime };
}

export async function GET() {
  try {
    // last (already-started) event:
    //   start_date < today  OR  (start_date = today AND start_time <= now)
    const { today, nowTime } = nowPartsUTC();
    const pastExpr = `start_date.lt.${today},and(start_date.eq.${today},start_time.lte.${nowTime})`;

    const evRes = await createServer()
      .from("events")
      .select("id,name,location,start_date,start_time,attendees,budget,spending")
      .or(pastExpr)
      .order("start_date", { ascending: false })
      .order("start_time", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (evRes.error) throw evRes.error;

    // If there’s truly no past event yet, short-circuit with 404 (or
    // you could fall back to the very next upcoming event if you prefer)
    if (!evRes.data) {
      return NextResponse.json({ error: "No past events found" }, { status: 404 });
    }

    const ev = evRes.data;

    // Try to load stats (optional)
    const stRes = await createServer()
      .from("event_stats")
      .select("*")
      .eq("event_id", ev.id)
      .maybeSingle();
    if (stRes.error) throw stRes.error;

    const reg = stRes.data?.registered_count ?? Math.max(ev.attendees ?? 0, 0);
    const attended = stRes.data?.attended_count ?? Math.max(ev.attendees ?? 0, 0);
    const walkins  = stRes.data?.walkins_count  ?? Math.round(attended * 0.1);
    const noShow   = Math.max(reg - attended, 0);

    const ratingAvg   = stRes.data?.rating_avg ?? null;
    const ratingCount = stRes.data?.rating_count ?? 0;

    const fbRes = await createServer()
      .from("event_feedback")
      .select("sentiment,text")
      .eq("event_id", ev.id)
      .limit(10);

    const pros = (fbRes.data ?? []).filter(f => f.sentiment === "pro").map(f => f.text);
    const cons = (fbRes.data ?? []).filter(f => f.sentiment === "con").map(f => f.text);

    const total = attended + noShow;
    const attendancePct = total > 0 ? Math.round((attended / total) * 100) : 0;

    return NextResponse.json({
      event: {
        id: ev.id,
        name: ev.name,
        location: ev.location,
        startDate: ev.start_date,
        startTime: ev.start_time,
        budget: ev.budget,
        spending: ev.spending,
      },
      metrics: {
        registered: reg,
        attended,
        walkins,
        noShow,
        attendancePct,
        ratingAvg,
        ratingCount,
      },
      feedback: { pros, cons },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
