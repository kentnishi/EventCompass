import { NextResponse as N } from "next/server";


export async function GET() {
const attended = 54, walkins = 14, noshow = 2;
const total = attended + walkins + noshow;
const pct = Math.round((attended / total) * 100);
return N.json({
event: { id: 1, title: "MOVIE & DINE", when: "Fri, 9/5/25 (5-7 PM)", where: "Thwing Ballroom ($0)" },
stats: { total, attended, walkins, noshow, pct },
feedback: {
pro: "Fun event, enjoyed the movie + timing",
con: "Food cold, so cold that I felt like I was in the ice age. Screen so small, Volume not volumed",
},
});
}