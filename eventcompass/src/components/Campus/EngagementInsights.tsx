"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "@/components/charts/BaseChart";
import type {
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";

type CountRow = { label: string; count: number };

async function getJSON<T>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  } catch (e) {
    console.error("engagement fetch error", e);
    return [] as unknown as T;
  }
}

export default function EngagementInsights() {
  const [welcoming, setWelcoming] = useState<CountRow[]>([]);
  const [channels, setChannels] = useState<CountRow[]>([]);
  const [barriers, setBarriers] = useState<CountRow[]>([]);
  const [themes, setThemes] = useState<CountRow[]>([]);

  useEffect(() => {
    (async () => {
      const [w, c, b, t] = await Promise.all([
        getJSON<CountRow[]>("/api/analytics/engagement/welcoming"),
        getJSON<CountRow[]>("/api/analytics/engagement/channels"),
        getJSON<CountRow[]>("/api/analytics/engagement/barriers"),
        getJSON<CountRow[]>("/api/analytics/engagement/themes"),
      ]);
      setWelcoming(w);
      setChannels(c);
      setBarriers(b);
      setThemes(t);
    })();
  }, []);

  /* ---------- Welcoming (donut) ---------- */

  const welcomingCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!welcoming.length) return null;

    const labels = welcoming.map((r) => r.label);
    const counts = welcoming.map((r) => r.count);
    const total = counts.reduce((a, b) => a + b, 0) || 1;

    const data = counts.map((c) => (c / total) * 100);

    const topIdx = data.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
    const pct = data[topIdx].toFixed(1);
    const center = `${pct}%\n${labels[topIdx]}`;

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"doughnut">) => {
              const i = ctx.dataIndex;
              const row = welcoming[i];
              const p = ((row.count / total) * 100).toFixed(1);
              return `${row.label}: ${row.count} (${p}%)`;
            },
          },
        },
        doughnutCenterText: { text: center } as any,
      },
    };

    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#60A5FA", "#A3BFFA", "#D1D5DB"],
            borderWidth: 0,
          },
        ],
      },
      options,
      plugins: [doughnutCenterText],
    };
  }, [welcoming]);

  /* ---------- Channels (horizontal bar) ---------- */

  const channelsCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!channels.length) return null;

    const top = [...channels].sort((a, b) => b.count - a.count).slice(0, 6);

    const labels = top.map((r) => r.label);
    const data = top.map((r) => r.count);
    const max = Math.max(...data, 1);

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: max * 1.1,
        },
        y: {
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
            label: "Number of students",
            data,
            backgroundColor: "#7EA6F8",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [channels]);

  /* ---------- Barriers (horizontal bar) ---------- */

  const barriersCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!barriers.length) return null;

    const top = [...barriers].sort((a, b) => b.count - a.count).slice(0, 6);

    const labels = top.map((r) => r.label);
    const data = top.map((r) => r.count);
    const max = Math.max(...data, 1);

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: max * 1.1,
        },
        y: {
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
            label: "Number of students",
            data,
            backgroundColor: "#6a92f9",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [barriers]);

  /* ---------- Themes (chips) ---------- */

  const topThemes = useMemo(
  () => {
    if (!themes.length) return [];

    const sorted = [...themes].sort((a, b) => b.count - a.count);
    const total = sorted.reduce((sum, t) => sum + t.count, 0) || 1;

    return sorted.slice(0, 7).map((t) => ({
      label: t.label,
      count: t.count,
      percent: (t.count / total) * 100,
    }));
  },
  [themes]
);

  return (
    <div>
        <div className="bg-[#d4dcf1] rounded-[12px] p-4 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Welcoming */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">
                    Are Events Welcoming To All Students?
                </h3>
                <p className="text-[11px] text-[#7a86a8] mb-3">
                    How students feel about inclusivity at UPB events.
                </p>
                <div className="h-[240px]">
                    {welcomingCfg ? (
                    <BaseChart
                        config={welcomingCfg as ChartConfiguration}
                        height={240}
                    />
                    ) : (
                    <p className="text-xs text-gray-400 mt-6">
                        No welcoming data yet.
                    </p>
                    )}
                </div>
                </div>

                {/* Channels */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1 ]">
                    How Students Hear About Events
                </h3>
                <p className="text-[11px] text-[#7a86a8] mb-3">
                    Top communication channels students say they use.
                </p>
                <div className="h-[240px]">
                    {channelsCfg ? (
                    <BaseChart
                        config={channelsCfg as ChartConfiguration}
                        height={240}
                    />
                    ) : (
                    <p className="text-xs text-gray-400 mt-6">
                        No channel data yet.
                    </p>
                    )}
                </div>
                </div>

                {/* Barriers */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">
                    What Stops Students From Attending More Events?
                </h3>
                <p className="text-[11px] text-[#7a86a8] mb-3">
                    Top barriers that keep students from showing up.
                </p>
                <div className="h-[240px]">
                    {barriersCfg ? (
                    <BaseChart
                        config={barriersCfg as ChartConfiguration}
                        height={240}
                    />
                    ) : (
                    <p className="text-xs text-gray-400 mt-6">
                        No barrier data yet.
                    </p>
                    )}
                </div>
                </div>

                {/* Themes */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">
                    What Helps Students Feel More Connected?
                </h3>
                <p className="text-[11px] text-[#7a86a8] mb-3">
                    Common themes from open-ended responses.
                </p>

                {topThemes.length ? (
                    <div className="space-y-3">
                    {/* Top theme highlight */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eef2ff] text-[11px] text-[#1f2937]">
                        <span className="text-xs">🔥</span>
                        <span className="font-medium">
                        Top theme:&nbsp;
                        {topThemes[0].label}
                        </span>
                        <span className="text-[10px] text-[#6b7280]">
                        {topThemes[0].percent.toFixed(1)}% of mentions
                        </span>
                    </div>

                    {/* Theme chips with counts */}
                    <div className="grid gap-2 sm:grid-cols-2">
                        {topThemes.map((t, idx) => (
                        <div
                            key={t.label}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-[#f3f5ff] border border-[#dde3ff]"
                        >
                            <span
                                className="text-[11px] text-[#374151] leading-snug whitespace-normal break-words pr-2"
                                title={t.label}
                            >
                            {idx === 0 ? (
                                <span className="font-semibold">{t.label}</span>
                            ) : (
                                t.label
                            )}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white text-[10px] text-[#4b5563] tabular-nums">
                            n={t.count}
                            </span>
                        </div>
                        ))}
                    </div>
                    </div>
                ) : (
                    <p className="text-xs text-[#7a86a8] mt-2">
                    No theme data yet.
                    </p>
                )}
                </div>
            </div>
      </div>
    </div>
  );
}
