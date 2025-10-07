import { NextResponse as Next } from "next/server";


export async function GET() {
const payload = {
popularDays: [
{ day: "Mon", count: 300 },
{ day: "Tues", count: 220 },
{ day: "Wed", count: 340 },
{ day: "Thu", count: 500 },
{ day: "Fri", count: 260 },
{ day: "Sat", count: 150 },
{ day: "Sun", count: 120 },
],
popularTimes: Array.from({ length: 16 }).map((_, idx) => {
const hour = 8 + idx;
const score = Math.exp(-0.5 * Math.pow((hour - 18) / 3, 2)) * 100 + 10;
return { time: `${hour}:00`, score: Math.round(score) };
}),
vendors: [
{ name: "SITOOS", rating: 4.2 },
{ name: "MOCHINUT", rating: 4.2 },
{ name: "UR MOTHER", rating: 4.2 },
{ name: "GIGASLAD ERM VEN...", rating: 4.2 },
],
themes: ["FREE", "MERCH", "VIDEO GAMES", "GAMBLING"],
};
return Next.json(payload);
}