"use client";
import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "./charts/BaseChart";
import type { ChartConfiguration, ChartOptions } from "chart.js";

type ApiPayload = {
  event: {
    id: string;
    name: string;
    location: string | null;
    startDate: string; // YYYY-MM-DD
    startTime: string | null; // HH:MM:SS
    budget: number | null;
    spending: number | null;
  };
  metrics: {
    registered: number;
    attended: number;
    walkins: number;
    noShow: number;
    attendancePct: number; // 0..100
    ratingAvg: number | null;
    ratingCount: number;
  };
  feedback: {
    pros: string[];
    cons: string[];
  };
};

export default function LastEventAnalytics() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/last-analytics")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load last event"));
  }, []);

  const donutCfg: ChartConfiguration<"doughnut"> | null = useMemo(() => {
    if (!data) return null;
    const { attended, walkins, noShow, attendancePct } = data.metrics;
    const total = attended + noShow;

    const options: ChartOptions<"doughnut"> = {
      cutout: "75%",
      plugins: { doughnutCenterText: { text: `${attendancePct}%\nTotal: ${total}\nAttendance` } },
    };

    return {
      type: "doughnut",
      data: {
        labels: ["Attended", "Walk-ins", "No Show"],
        datasets: [
          {
            data: [attended, walkins, noShow],
            backgroundColor: ["#3B82F6", "#93C5FD", "#E5E7EB"],
            borderWidth: 0,
          },
        ],
      },
      options,
      plugins: [doughnutCenterText],
    };
  }, [data]);

  if (err) {
    return (
      <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Last Event Analytics</h2>
        <div className="text-red-600 text-sm">{err}</div>
      </div>
    );
  }

  if (!data) {
    // skeleton
    return (
      <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 w-56 bg-gray-200 rounded mb-6" />
        <div className="h-8 w-80 bg-gray-200 rounded mb-4" />
        <div className="h-64 w-full bg-gray-100 rounded mb-6" />
        <div className="h-5 w-64 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>
    );
  }

  const { event, metrics, feedback } = data;
  const start = new Date(`${event.startDate}T${event.startTime ?? "00:00:00"}`);

  return (
    <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Last Event Analytics</h2>
      <h3 className="bg-[white] rounded-[10px] border border-[#d6d9e7] scale-99">
        <h4 className= "scale-98">
      <div className="text-left rounded-[10px]">
        <h3 className="text-[30px] font-bold tracking-wide">{event.name}</h3>
        <div className="flex justify-left items-left my-2 text-[text-[#ffb901]">
          {/* star fill based on ratingAvg if available */}
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = (metrics.ratingAvg ?? 0) >= i + 1;
            return (
              <span key={i} className={filled ? "text-[#ffb901]" : "text-gray-300"}>
                ★
              </span>
            );
          })}
          <span className="text-gray-500 font-medium ml-2">
            ({metrics.ratingCount})
          </span>
        </div>
      </div>
      

      <div className="my-6">{donutCfg && <BaseChart config={donutCfg} height={320} />}</div>

      <div className="text-center my-6">
        <p className="text-3xl font-bold">
          {start.toLocaleDateString(undefined, {
            weekday: "short",
            month: "numeric",
            day: "numeric",
          })}{" "}
          ({start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })})
        </p>
        <p className="text-gray-500 text-xl">
          {event.location || "TBD"}{" "}
          {event.spending != null ? `( $${Number(event.spending).toFixed(0)} )` : ""}
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-2">Feedback</h4>
        <div className="text-sm space-y-2">
          {feedback.pros.slice(0, 2).map((t, i) => (
            <p key={`pro-${i}`}>
              <span className="font-semibold">Pro:</span> {t}
            </p>
          ))}
          {feedback.cons.slice(0, 2).map((t, i) => (
            <p key={`con-${i}`}>
              <span className="font-semibold">Con:</span> {t}
            </p>
          ))}
          {feedback.pros.length === 0 && feedback.cons.length === 0 && (
            <p className="text-gray-500">No feedback yet.</p>
          )}
        </div>
      </div>
      </h4>
      </h3>
    </div>
    
  );
}
