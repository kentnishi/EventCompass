import { NextResponse } from "next/server";
import { client } from "../../../../../../lib/supabase";


const IDEAL_SIZE_DEFAULT = 115;


const TYPE_POPULARITY: Record<string, number> = {
    Performance: 0.8,
    Social: 0.9,
    Tour: 0.7,
    Luncheon: 1.0,
    Outdoors: 0.6,
    Other: 0.5,
};


const DOW_WEIGHTS: number[] = [0.4, 0.3, 0.4, 0.4, 1.0, 1.0, 0.9];
// morning [06:00,12:00), afternoon [12:00,17:00), evening [17:00,22:00), late [22:00,02:00)
const TIME_BUCKET_WEIGHTS: number[] = [0.1, 0.5, 1.0, 0.7];


const EXAM_PERIODS: Array<{ start: string; end: string }> = [
    { start: "2025-10-13", end: "2025-10-18" },
    { start: "2025-12-08", end: "2025-12-17" },
];
const EXAM_PROX_WINDOW_DAYS = 5;


const RATING_PRIOR_MEAN = 3.0;
const RATING_PRIOR_K = 0;


const SEED_W_ATT = 0.6;
const SEED_W_RATE = 0.4;


const TARGET_CPP = 35; // budgeting target /attendee


const REG_REQUIRED_WEIGHT = 0.64;
const REG_WALKIN_WEIGHT = 0.36;


const ON_CAMPUS_LIST = [
    'thwing atrium',
    'hovorka atrium',
    'ksl oval',
    'thwing ballroom',
    'guilford house',
    'strosacker',
    'adelbert gym',
    'eastbell commons',
    'tink ballroom',
    'tvuc soc',
    'freiburger field',
];




const ON_CAMPUS_WEIGHT = 0.729;
const OFF_CAMPUS_WEIGHT = 0.271;


function scoreRegistration(regRequired?: boolean | null) {
    return regRequired ? REG_REQUIRED_WEIGHT : REG_WALKIN_WEIGHT;
}


function scoreLocationFromString(loc?: string | null) {
    if (!loc) return OFF_CAMPUS_WEIGHT;
    const L = loc.toLowerCase();
    const isOnCampus = ON_CAMPUS_LIST.some(s => L.includes(s));
    return isOnCampus ? ON_CAMPUS_WEIGHT : OFF_CAMPUS_WEIGHT;
}


// helpers
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));


function dayOfWeekIndex(d?: Date | null) {
    if (!d || Number.isNaN(d.getTime())) return 4; // default Friday
    const js = d.getDay(); // 0=Sun..6=Sat
    return (js + 6) % 7; // 0=Mon..6=Sun
}


function timeBucketIndex(t?: string | null) {
    if (!t || typeof t !== "string") return 2; // default evening
    const [H, M] = t.split(":").map(Number);
    const minutes = (H ?? 0) * 60 + (M ?? 0);
    const inRange = (a: number, b: number) =>
        a <= b ? minutes >= a && minutes < b : minutes >= a || minutes < b;


    if (inRange(6 * 60, 12 * 60)) return 0;  // morning
    if (inRange(12 * 60, 17 * 60)) return 1; // afternoon
    if (inRange(17 * 60, 22 * 60)) return 2; // evening
    if (inRange(22 * 60, 2 * 60)) return 3; // late
    return 2;
}


function minDaysToExam(startISO?: string | null, endISO?: string | null) {
    if (!startISO) return 9999;
    const s = new Date(startISO);
    const e = new Date(endISO ?? startISO);
    let minDays = Infinity;
    for (const { start, end } of EXAM_PERIODS) {
        const a = new Date(start), b = new Date(end);
        if (s <= b && e >= a) return 0; // overlaps
        const before = Math.max(0, (a.getTime() - e.getTime()) / 86400e3);
        const after = Math.max(0, (s.getTime() - b.getTime()) / 86400e3);
        const d = Math.min(before, after);
        if (d < minDays) minDays = d;
    }
    return isFinite(minDays) ? minDays : 9999;
}


function normalizeTypePopularity(eventType?: string | null) {
    if (!eventType) return TYPE_POPULARITY.Other;
    // exact or case-insensitive match
    if (TYPE_POPULARITY[eventType as keyof typeof TYPE_POPULARITY] != null) {
        return TYPE_POPULARITY[eventType as keyof typeof TYPE_POPULARITY];
    }
    const k = Object.keys(TYPE_POPULARITY).find(
        (key) => key.toLowerCase() === eventType.toLowerCase()
    );
    return k ? TYPE_POPULARITY[k] : TYPE_POPULARITY.Other;
}


function scoreTiming(startDate?: string | null, endDate?: string | null, startTime?: string | null) {
    const dow = DOW_WEIGHTS[dayOfWeekIndex(startDate ? new Date(startDate) : null)] ?? 0.5;
    const tb = TIME_BUCKET_WEIGHTS[timeBucketIndex(startTime)] ?? 0.5;
    const days = minDaysToExam(startDate, endDate ?? startDate);
    const prox = days >= EXAM_PROX_WINDOW_DAYS
        ? 1
        : clamp01(1 - (EXAM_PROX_WINDOW_DAYS - days) / EXAM_PROX_WINDOW_DAYS);
    return (((dow + tb + prox) / 3)); //adjusted
}


function scoreStructure(eventType?: string | null, registered?: number | null) {
    const popularity = clamp01(normalizeTypePopularity(eventType));

    // If registered is null or 0 → return neutral score 0.5
    if (registered == null || registered === 0) {
        return 0.5;
    }

    const ideal = IDEAL_SIZE_DEFAULT;
    const reg = Math.max(1, registered);  // ensure positive

    const sizeFit = clamp01(
        1 - Math.abs(reg - ideal) / Math.max(ideal, 1)
    );

    return (popularity + sizeFit) / 2;
}



function scoreIncentives(food_provided?: boolean | null, giveaway?: boolean | null) {
    const foodScore = food_provided ? 0.70 : 0.0;   // weight for food
    const giveawayScore = giveaway ? 0.30 : 0.0;   // weight for giveaways
    return clamp01(foodScore + giveawayScore);
}



function scoreBudgeting(spent?: number | null, attended?: number | null) {
    // Handle invalid or missing spent values
    if (spent === 0 || spent === -1 || spent == null) {
        return 0;   // direct score 0
    }

    // Normal behavior for valid spend
    const att = Math.max(1, attended ?? 0);
    const cpp = spent / att;

    const overspend = Math.max(0, cpp - TARGET_CPP);
    const overspendRatio = overspend / TARGET_CPP;

    const score = Math.exp(-overspendRatio);
    return clamp01(score);
}



function attendanceRate(attended?: number | null, registered?: number | null) {
    const r = Math.max(1, registered ?? 0);
    return clamp01(Math.max(0, (attended ?? 0) / r));
}
function normalizedRating(ratingAvg?: number | null, ratingCount?: number | null) {
    const n = Math.max(0, ratingCount ?? 0);
    if (n <= 0) return 0.5; // neutral if no ratings
    const shrunk =
        ((ratingAvg ?? RATING_PRIOR_MEAN) * n + RATING_PRIOR_MEAN * RATING_PRIOR_K) /
        (n + RATING_PRIOR_K);
    return clamp01((shrunk - 1) / 4);
}
function toFivePoint(att: number, rate: number) {
    const yStar = SEED_W_ATT * att + SEED_W_RATE * rate;
    const five = Math.round(1 + 4 * clamp01(yStar));
    return Math.max(1, Math.min(5, five));
}


export async function POST() {
    const { data: events, error } = await client.from("past_events").select("*");
    if (error) {
        console.error("[update_scores] select error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log(
        "[update_scores] fetched past_events:",
        Array.isArray(events) ? events.length : 0,
        "rows"
    );
    if (Array.isArray(events) && events.length > 0) {
        console.log("[update_scores] sample event:", events[0]);
    }
    console.log("[update_scores] loaded events:", events?.length ?? 0);


    const rows =
        (events ?? []).map((e: any) => {
            const timing = scoreTiming(e.start_date, e.end_date, e.start_time);
            const structure = scoreStructure(e.event_type, e.registered_count);
            const incentives = scoreIncentives(e.food_provided, e.giveaways);
            const budgeting = scoreBudgeting(e.spent, e.attended_count);


            const registration = scoreRegistration(!!e.registration_required);
            const location = scoreLocationFromString(e.location);


            const att_rate = attendanceRate(e.attended_count, e.registered_count);
            const norm_rate = normalizedRating(e.rating_avg, e.rating_count);
            const score = toFivePoint(att_rate, norm_rate);


            return {
                event_id: e.id,
                updated: new Date().toISOString(),
                timing,
                structure,
                incentives,
                location,
                registration,
                budgeting,
                attendance_rate: att_rate,
                normalized_rating: norm_rate,
                score,
            };
        }) ?? [];


    try {
        const { data: upData, error: upErr } = await client
            .from("event_stats")
            .upsert(rows, { onConflict: "event_id" })
            .select("event_id");


        if (upErr) {
            console.error("[update_scores] upsert error:", upErr);
            return NextResponse.json({ error: upErr.message }, { status: 500 });
        }


        console.log("[update_scores] upserted rows:", upData?.length ?? 0);


    } catch (e: any) {
        console.error("[update_scores] crash:", e);
        return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
    }


    return NextResponse.json({ upserted: rows.length });
}



