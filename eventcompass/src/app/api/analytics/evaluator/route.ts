import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";


// basic matrix helpers
function transpose(A: number[][]) {
    if (!Array.isArray(A) || A.length === 0) return [];
    return A[0].map((_, i) => A.map(r => r[i]));
}


function matMul(A: number[][], B: number[][]) {
    const res: number[][] = Array.from({ length: A.length }, () => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++)for (let k = 0; k < B.length; k++)for (let j = 0; j < B[0].length; j++)res[i][j] += A[i][k] * B[k][j];
    return res;
}
function invSymmetric(M: number[][]) { // naive Gauss-Jordan 7x7
    const n = M.length;
    const A = M.map(r => r.slice()); const I = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i === j ? 1 : 0));
    for (let i = 0; i < n; i++) {
        // pivot
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


export async function GET() {
    const { data, error } = await supabase
        .from('event_stats')
        .select('timing,structure,incentives,location,registration,budgeting,score')
        .not('score', 'is', null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });


    console.log("[evaluator] rows before filter:", data?.length ?? 0);


    const rows = (data ?? []).filter(r =>
        [r.timing, r.structure, r.incentives, r.location, r.registration, r.budgeting, r.score]
            .every(v => v !== null && v !== undefined && Number.isFinite(Number(v)))
    );


    console.log("[evaluator] rows usable:", rows.length);


    if (rows.length === 0) {
        return NextResponse.json({
            n: 0,
            predictions: [],
            reason: "No usable rows in event_stats. Run /api/analytics/evaluator/update_scores first, then check RLS/keys."
        });
    }



    console.log('[evaluator] rows before filter:', data?.length ?? 0);
    console.log('[evaluator] rows usable:', rows.length);
    // if (rows.length < 8) {
    //     return NextResponse.json({ error: 'not enough rows for regression (need ~8+)' }, { status: 400 });
    // }




    const X = rows.map(r => [
        1,
        r.timing,
        r.structure,
        r.incentives,
        r.location,
        r.registration,
        r.budgeting,
    ]);
    const y = rows.map(r => [Number(r.score)]);




    const Xt = transpose(X);
    const XtX = matMul(Xt, X);
    const XtXinv = invSymmetric(XtX);
    const XtY = matMul(Xt, y);
    const beta = matMul(XtXinv, XtY).map(r => r[0]); // [b0,b_timing,...]


    return NextResponse.json({
        n: rows.length,
        intercept: beta[0],
        coefficients: {
            timing: beta[1],
            structure: beta[2],
            incentives: beta[3],
            location: beta[4],
            registration: beta[5],
            budgeting: beta[6],
        }
    });


}



