"use client";

import React, { useEffect, useState } from "react";

interface ForecastTabProps {
    eventId: string;   
    attendees: number;
}

type OnePred =
    | { event_id: string; predicted_score: number; features?: any }
    | null;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function outcomesFromScore(predicted_score: number) {
    const yStar = clamp01((predicted_score - 1) / 4); // 0..1
    return {
        attendance: clamp01(0.8 * yStar + 0.2),
        rating: 2.8 * yStar + 2.2,
    };
}

const ForecastTab: React.FC<ForecastTabProps> = ({ eventId, attendees }) => {
    const [loading, setLoading] = useState(false);
    const [one, setOne] = useState<OnePred>(null);
    const [error, setError] = useState<string | null>(null);

    async function fetchPrediction() {
        try {
            setLoading(true);
            setError(null);

            // try predict
            let res = await fetch(`/api/analytics/evaluator/predict?id=${eventId}`);
            let data = await res.json();

            // If prediction fails due to regression rows
            if (
                data?.error &&
                data.error.includes("Not enough regression rows yet.")
            ) {
                console.warn("[Forecast] Not enough rows — running update_scores...");

                // Attempt update_scores
                const update = await fetch(
                    `/api/analytics/evaluator/update_scores`,
                    { method: "POST" }
                );
                console.log("[update_scores] status:", update.status);

                // Try prediction again
                res = await fetch(`/api/analytics/evaluator/predict?id=${eventId}`);
                data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error ?? `Prediction failed after update`);
                }
            }

            if (!res.ok) {
                throw new Error(data?.error ?? `HTTP ${res.status}`);
            }

            setOne(data);
        } catch (e: any) {
            setError(e?.message ?? "Unknown prediction error");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchRegressionModel();
        fetchPrediction();
    }, [eventId]);

    const oneOut = one ? outcomesFromScore(one.predicted_score) : null;

    async function fetchRegressionModel() {
        try {
            const res = await fetch("/api/analytics/evaluator");
            const data = await res.json();

            if (!res.ok) {
                console.error("[regression model error]:", data?.error ?? data);
                return;
            }

            console.log("[EVALUATOR REGRESSION]");
            console.log("n:", data.n);
            console.log("intercept:", data.intercept);
            console.log("coefficients:", data.coefficients);

        } catch (err) {
            console.error("[regression model fetch failed]:", err);
        }
    }


    return (
        <div
            style={{
                backgroundColor: "#FFF",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <h3
                style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#333",
                    marginBottom: "16px",
                }}
            >
                Event Forecast
            </h3>

            <button
                onClick={fetchPrediction}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#6B7FD7",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: "20px",
                }}
                disabled={loading}
            >
                {loading ? "Predicting…" : "Recalculate Forecast"}
            </button>

            {error && (
                <p style={{ color: "red", marginTop: "8px" }}>
                    Error: {error}
                </p>
            )}

            {one && (
                <div
                    style={{
                        marginTop: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                        Predicted Score:{" "}
                        <span style={{ color: "#6B7FD7" }}>
                            {one.predicted_score.toFixed(2)} / 5.00
                        </span>
                    </div>

                    {oneOut && (
                        <>
                            <div style={{ marginTop: "12px", fontSize: "1rem" }}>
                                Expected Attendance:{" "}
                                <b>{(oneOut.attendance * 100).toFixed(1)}%</b>
                            </div>

                            <div style={{ marginTop: "6px", fontSize: "1rem" }}>
                                Expected Rating:{" "}
                                <b>{oneOut.rating.toFixed(2)}</b>
                            </div>

                            <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#666" }}>
                                if {attendees} registered ⇒ approx{" "}
                                <b>{Math.round(attendees * oneOut.attendance)}</b> attendees
                            </div>

                        </>
                    )}

                    {one.features && (
                        <div style={{ marginTop: "20px" }}>
                            <h4
                                style={{
                                    marginBottom: "8px",
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                }}
                            >
                                Feature Contributions
                            </h4>

                            <div style={{ fontSize: "0.9rem", color: "#555" }}>
                                {Object.entries(one.features).map(([key, value]) => {
                                    const numeric = Number(value);
                                    const display =
                                        numeric <= 0 || isNaN(numeric)
                                            ? "N/A"
                                            : `${(numeric * 100).toFixed(1)}%`;

                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "6px 0",
                                                borderBottom: "1px solid #eee",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{key}</span>
                                            <span>{display}</span>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loading && !one && (
                <p style={{ marginTop: "12px", color: "#666" }}>No prediction yet.</p>
            )}
        </div>
    );
};

export default ForecastTab;
