'use client';

import { useEffect, useState } from 'react';

type Prediction = { event_id: string; predicted_score: number };
type RegressionResponse = { n: number; predictions: Prediction[] };
type OnePred = { event_id: string; predicted_score: number; features?: any } | null;


export default function TasksPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

  async function runRegression() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/analytics/evaluator', { method: 'GET' });
      console.log('[regression] status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RegressionResponse = await res.json();
      console.log('[regression] payload:', data);
      setPreds(data.predictions ?? []);
    } catch (e: any) {
      console.error('[regression] error:', e);
      setErr(e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function updateScoresThenRun() {
    try {
      const r = await fetch('/api/analytics/evaluator/update_scores', { method: 'POST' });
      console.log('[update_scores] status:', r.status);
    } catch (e) {
      console.error('[update_scores] error:', e);
    }
    runRegression();
  }

  useEffect(() => { runRegression(); }, []);

  const [one, setOne] = useState<OnePred>(null);

  async function predictOne(id: string) {
    try {
      const res = await fetch(`/api/analytics/evaluator/predict?id=${id}`);
      console.log('[predictOne] status:', res.status);
      const data = await res.json();
      console.log('[predictOne] payload:', data);
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setOne(data);
    } catch (e: any) {
      setErr(e?.message ?? 'Predict failed');
    }
  }
  
  function outcomesFromScore(predicted_score: number) {
    const yStar = clamp01((predicted_score - 1) / 4);           // 0..1
    return {
      attendance: clamp01(0.8 * yStar + 0.2),                   // 10%..100%
      rating: 2.8 * yStar + 2.2,         // ~2..5
    };
  }

  const oneOut = one ? outcomesFromScore(one.predicted_score) : null;



  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <p>Placeholder for Tasks.</p>

      <div className="flex gap-3">
        <button onClick={runRegression} disabled={loading} className="border rounded px-3 py-2">
          {loading ? 'Running…' : 'Run Regression'}
        </button>
        <button onClick={updateScoresThenRun} className="border rounded px-3 py-2">
          Update Scores → Run
        </button>
        <button
          onClick={() => predictOne('e6c1118f-facf-4ca8-beea-bb965c433bda')} //preset id
          className="border rounded px-3 py-2 bg-blue-50 hover:bg-blue-100"
        >
          Predict This Event
        </button>
        {err && <span className="text-red-600">Error: {err}</span>}
      </div>

      {one && (
        <div className="mt-4 border rounded p-3">
          <div className="font-mono text-sm">event_id: {one.event_id}</div>
          <div className="text-lg">
            predicted_score: <b>{one.predicted_score.toFixed(2)}</b>
          </div>
          {oneOut && (
            <>
              <div>expected_attendance: <b>{(oneOut.attendance * 100).toFixed(1)}%</b></div>
              <div>expected_rating: <b>{oneOut.rating.toFixed(2)}</b></div>

              {/* example expected attendees given 150 registered THIS IS HARD CODED*/}
              <div className="text-sm text-gray-600">
                if 150 registered ⇒ ~{Math.round(150 * oneOut.attendance)} attendees
              </div>
            </>
          )}
        </div>
      )}



      {preds.length > 0 ? (
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Event ID</th>
              <th className="border px-2 py-1 text-left">Predicted Score</th>
              <th className="border px-2 py-1 text-left">Exp. Attendance %</th>
              <th className="border px-2 py-1 text-left">Exp. Rating</th>
            </tr>
          </thead>
          <tbody>
            {preds.map(p => {
              const o = outcomesFromScore(p.predicted_score);
              return (
                <tr key={p.event_id} data-testid="prediction-row">
                  <td className="border px-2 py-1 font-mono">{p.event_id}</td>
                  <td className="border px-2 py-1">{p.predicted_score.toFixed(2)}</td>
                  <td className="border px-2 py-1">{(o.attendance * 100).toFixed(1)}%</td>
                  <td className="border px-2 py-1">{o.rating.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>

        </table>
      ) : (
        !loading && !err && <p className="text-sm text-gray-500">No predictions yet.</p>
      )}
    </div>
  );
}
