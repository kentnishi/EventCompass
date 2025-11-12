import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabase";

const IDEAL_SIZE_DEFAULT = 115;
const TYPE_POPULARITY: Record<string, number> = {
    Performance: 0.8, Social: 0.9, Tour: 0.7, Luncheon: 1.0, Outdoors: 0.6, Other: 0.5,
};
const DOW_WEIGHTS: number[] = [0.4, 0.3, 0.4, 0.4, 1.0, 1.0, 0.9];
const TIME_BUCKET_WEIGHTS: number[] = [0.1, 0.5, 1.0, 0.7];
const EXAM_PERIODS = [
    { start: "2025-10-13", end: "2025-10-18" },
    { start: "2025-12-08", end: "2025-12-17" },
];
const EXAM_PROX_WINDOW_DAYS = 5;
const TARGET_CPP = 35;

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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const dayOfWeekIndex = (d?: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return 4;
    return (d.getDay() + 6) % 7;
};
const timeBucketIndex = (t?: string | null) => {
    if (!t || typeof t !== "string") return 2;
    const [H, M] = t.split(":").map(Number);
    const minutes = (H ?? 0) * 60 + (M ?? 0);
    const inRange = (a: number, b: number) => a <= b ? (minutes >= a && minutes < b) : (minutes >= a || minutes < b);
    if (inRange(6 * 60, 12 * 60)) return 0;
    if (inRange(12 * 60, 17 * 60)) return 1;
    if (inRange(17 * 60, 22 * 60)) return 2;
    if (inRange(22 * 60, 2 * 60)) return 3;
    return 2;
};
function minDaysToExam(startISO?: string | null, endISO?: string | null) {
    if (!startISO) return 9999;
    const s = new Date(startISO), e = new Date(endISO ?? startISO);
    let min = Infinity;
    for (const { start, end } of EXAM_PERIODS) {
        const a = new Date(start), b = new Date(end);
        if (s <= b && e >= a) return 0;
        const before = Math.max(0, (a.getTime() - e.getTime()) / 86400e3);
        const after = Math.max(0, (s.getTime() - b.getTime()) / 86400e3);
        min = Math.min(min, Math.min(before, after));
    }
    return isFinite(min) ? min : 9999;
}
function normalizeTypePopularity(eventType?: string | null) {
    if (!eventType) return TYPE_POPULARITY.Other;
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
    const d = minDaysToExam(startDate, endDate ?? startDate);
    const prox = d >= EXAM_PROX_WINDOW_DAYS ? 1 : clamp01(1 - (EXAM_PROX_WINDOW_DAYS - d) / EXAM_PROX_WINDOW_DAYS);
    return (dow + tb + prox) / 3;
}
function scoreStructure(eventType?: string | null, registered?: number | null) {
    const popularity = clamp01(normalizeTypePopularity(eventType));
    const reg = Math.max(0, registered ?? 0);
    const sizeFit = clamp01(1 - Math.abs(reg - IDEAL_SIZE_DEFAULT) / Math.max(IDEAL_SIZE_DEFAULT, 1));
    return (popularity + sizeFit) / 2;
}
function scoreIncentives(food_provided?: boolean | null, giveaway?: boolean | null) {
    const foodScore = food_provided ? 0.7 : 0.0;   // weight for food is .7
    const giveawayScore = giveaway ? 0.3 : 0.0;   // weight for giveaways is .3
    return clamp01(foodScore + giveawayScore);
}
function scoreAudience() { return 0; }   // not yet wired
function scoreBudgeting(spent?: number | null, attended?: number | null) {
    const att = Math.max(1, attended ?? 0);
    const cpp = (spent ?? 0) / att;
    return clamp01(1 - Math.min(1, Math.abs(cpp - TARGET_CPP) / TARGET_CPP));
}
function scoreRegistration(regRequired?: boolean | null) {
    return regRequired ? REG_REQUIRED_WEIGHT : REG_WALKIN_WEIGHT;
}

function scoreLocationFromString(loc?: string | null) {
    if (!loc) return OFF_CAMPUS_WEIGHT;
    const L = loc.toLowerCase();
    const isOnCampus = ON_CAMPUS_LIST.some(s => L.includes(s));
    return isOnCampus ? ON_CAMPUS_WEIGHT : OFF_CAMPUS_WEIGHT;
}

function transpose(A: number[][]) { return A[0].map((_, i) => A.map(r => r[i])); }
function matMul(A: number[][], B: number[][]) {
    const R = Array.from({ length: A.length }, () => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) for (let k = 0; k < B.length; k++) for (let j = 0; j < B[0].length; j++) R[i][j] += A[i][k] * B[k][j];
    return R;
}
function inv(M: number[][]) {
    const n = M.length, A = M.map(r => r.slice());
    const I = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
    for (let i = 0; i < n; i++) {
        let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
        [A[i], A[p]] = [A[p], A[i]];[I[i], I[p]] = [I[p], I[i]];
        const piv = A[i][i] || 1e-12;
        for (let j = 0; j < n; j++) { A[i][j] /= piv; I[i][j] /= piv; }
        for (let r = 0; r < n; r++) if (r !== i) {
            const f = A[r][i];
            for (let j = 0; j < n; j++) { A[r][j] -= f * A[i][j]; I[r][j] -= f * I[i][j]; }
        }
    }
    return I;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    try {
        const { data: event, error: evErr } = await supabase.from("events").select("*").eq("id", id).single();
        if (evErr || !event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        const { data: rows, error: stErr } = await supabase
            .from("event_stats")
            .select("timing,structure,incentives,audience,budgeting,score");
        if (stErr) return NextResponse.json({ error: stErr.message }, { status: 500 });

        const usable = (rows ?? []).filter(r =>
            [r.timing, r.structure, r.incentives, r.audience, r.budgeting, r.score]
                .every(v => v !== null && v !== undefined && Number.isFinite(Number(v)))
        );
        if (usable.length < 6) {
            return NextResponse.json({ error: "Not enough regression rows yet." }, { status: 400 });
        }

        const X = usable.map(r => [1, r.timing, r.structure, r.incentives, r.audience, r.budgeting]);
        const y = usable.map(r => [Number(r.score)]);
        const Xt = transpose(X), XtX = matMul(Xt, X), XtY = matMul(Xt, y);
        const beta = matMul(inv(XtX), XtY).map(r => r[0]); // [β0..β5]

        const timing = scoreTiming(event.start_date, event.end_date, event.start_time);
        const structure = scoreStructure(event.event_type ?? null, event.attendees ?? null); // event_type may not exist; falls back to "Other"
        const incentives = scoreIncentives(event.food_provided, event.giveaways);
        const audience = scoreAudience();
        const budgeting = scoreBudgeting(event.spending ?? null, event.attendees ?? null); //temp
        const registration = scoreRegistration(!!event.registration_required);
        const location = scoreLocationFromString(event.location);

        const x = [1, timing, structure, incentives, audience, budgeting];

        let predicted = x.reduce((s, xi, i) => s + xi * beta[i], 0);
        predicted = Math.max(1, Math.min(5, predicted));

        return NextResponse.json({
            event_id: id,
            features: { timing, structure, incentives, audience, budgeting, registration, location },
            predicted_score: predicted
        });
    } catch (e: any) {
        console.error("[predict] error:", e);
        return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
    }
}
