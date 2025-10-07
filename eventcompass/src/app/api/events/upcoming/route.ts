import { NextResponse } from "next/server";


export async function GET() {
// mock events (replace with Supabase later)
const now = new Date();
const mock = Array.from({ length: 5 }).map((_, i) => ({
id: i + 1,
title: ["Movie & Dine", "Karaoke", "Game Night", "Free Merch", "Arcade Night"][i],
startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 17, 0, 0).toISOString(),
}));
return NextResponse.json(mock);
}