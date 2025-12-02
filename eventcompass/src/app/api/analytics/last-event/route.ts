import { NextRequest, NextResponse } from "next/server";
import { client } from "../../../../../lib/supabase";

function nowPartsLocal() {
  const d = new Date();
  return {
    today: d.toLocaleDateString("en-CA"),      // YYYY-MM-DD (local)
    nowTime: d.toTimeString().slice(0, 8),     // HH:MM:SS
  };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const committee = sp.get("committee") ?? "";
  const { today, nowTime } = nowPartsLocal();

  // past = start_date < today OR (start_date = today AND start_time <= now)
  const pastExpr = `start_date.lt.${today},and(start_date.eq.${today},start_time.lte.${nowTime})`;

  let q = client
    .from("events")
    .select("id,name,location,committee,start_date,start_time,end_date,end_time")
    .or(pastExpr)
    .order("start_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(1);

  if (committee) q = q.eq("committee", committee);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ev = data?.[0];
  if (!ev) return NextResponse.json(null);

  const when =
    `${ev.start_date} ${ev.start_time}` +
    (ev.end_date || ev.end_time ? ` – ${ev.end_date ?? ev.start_date} ${ev.end_time ?? ""}` : "");

  return NextResponse.json({
    id: ev.id,
    title: ev.name,
    where: ev.location ?? "",
    when,
    committee: ev.committee,
    startDate: ev.start_date,
    startTime: ev.start_time,
    endDate: ev.end_date,
    endTime: ev.end_time,
  });
}
