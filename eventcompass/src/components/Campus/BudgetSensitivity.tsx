"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "@/components/charts/BaseChart";
import type {
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";

/* ---------- Types ---------- */

type PayPoint = {
  label: string;  // "General Event", "On-campus", ...
  avg: number;
  median: number;
};

type TripRow = {
  label: string; // "Yes", "No", "Unsure"
  count: number;
};

/* ---------- Helper ---------- */

async function getJSON<T>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  } catch {
    return [] as unknown as T;
  }
}

/* ---------- Component ---------- */

export default function BudgetSensitivity() {
  const [pay, setPay] = useState<PayPoint[]>([]);
  const [trips, setTrips] = useState<TripRow[]>([]);

  useEffect(() => {
    (async () => {
      const [p, t] = await Promise.all([
        getJSON<PayPoint[]>("/api/analytics/budget/wtp-summary"),
        getJSON<TripRow[]>("/api/analytics/budget/trips-premium"),
      ]);
      setPay(p);
      setTrips(t);
    })();
  }, []);

  /* ---------- Chart 1: Willingness-to-pay (bar) ---------- */

  const payCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!pay.length) return null;

    const labels = pay.map((p) => p.label);
    const data = pay.map((p) => p.median); // median 중심으로

    const max = Math.max(...data);

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => {
              const i = ctx.dataIndex;
              const row = pay[i];
              return `Median: $${row.median} (Avg: $${row.avg.toFixed(2)})`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: max * 1.2,
          title: {
            display: true,
            text: "USD",
          },
        },
        x: {
          grid: { display: false },
        },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Median willingness to pay ($)",
            data,
            backgroundColor: "#6a92f9",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [pay]);

  /* ---------- Chart 2: Trips Premium (donut) ---------- */

  const tripCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!trips.length) return null;

    const labels = trips.map((t) => t.label);
    const data = trips.map((t) => t.count);

    const total = data.reduce((a, b) => a + b, 0);
    if (!total) return null;

    const topIdx = data.reduce(
      (m, v, i, arr) => (v > arr[m] ? i : m),
      0
    );
    const pct = ((data[topIdx] / total) * 100).toFixed(1);
    const center = `${pct}%\n${labels[topIdx]}`;

    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#a8c0ff","#6a92f9", "#D1D5DB"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { position: "bottom" },
          doughnutCenterText: { text: center } as any,
        },
      },
      plugins: [doughnutCenterText],
    };
  }, [trips]);

  return (
    <div>
      <div className="bg-[#d4dcf1] rounded-[12px] p-4 space-y-6">
        

      {/* 2-column layout on md+ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: WTP by event type */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-1">
            Willingness To Pay By Event Type
          </h3>
          <p className="text-[11px] text-[#7a86a8] mb-3">
            Median amount students are willing to pay for each event category
          </p>
          <div className="h-[240px]">
            {payCfg ? (
              <BaseChart config={payCfg} height={240} />
            ) : (
              <p className="text-xs text-gray-400 mt-6">
                No payment data yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Trips premium donut */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-1">
            Unique Trip Premium (Spring/Fall Break)
          </h3>
          <p className="text-[11px] text-[#7a86a8] mb-3">
            Share of students who say they&apos;d pay more for unique trips.
          </p>
          <div className="h-[240px]">
            {tripCfg ? (
              <BaseChart config={tripCfg as ChartConfiguration} height={240} />
            ) : (
              <p className="text-xs text-gray-400 mt-6">
                No trip premium data yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
