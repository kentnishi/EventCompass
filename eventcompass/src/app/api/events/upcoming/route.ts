import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";

function nowParts() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);           // YYYY-MM-DD (UTC)
  const nowTime = now.toISOString().slice(11, 19);         // HH:MM:SS (UTC)
  return { today, nowTime };
}

/**
 * GET /api/events/upcoming?limit=10&committee=On-Campus
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  const committee = url.searchParams.get("committee") ?? "";

  const { today, nowTime } = nowParts();

  // upcoming => start_date > today OR (start_date = today AND start_time > now)
  const orExpr = `start_date.gt.${today},and(start_date.eq.${today},start_time.gt.${nowTime})`;

  let query = supabase
    .from("events")
    .select("id,name,location,start_date,start_time,committee")
    .or(orExpr)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(limit);

  if (committee) query = query.eq("committee", committee);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const out = (data ?? []).map((e) => ({
    id: e.id,
    title: e.name,
    location: e.location ?? "",
    startDate: e.start_date,
    startTime: e.start_time,
  }));

  return NextResponse.json(out);
}
