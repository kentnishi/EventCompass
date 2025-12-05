"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "@/components/charts/BaseChart";
import type { ChartConfiguration, ChartOptions } from "chart.js";

/* ---------- Types ---------- */

type DayPoint = { label: string; cnt: number };
type TimePoint = { label: string; cnt: number };
type DietPoint = { label: string; cnt: number };

type VendorRow = {
  label: string;
  cnt: number;
  score: number;
};

type ThemeRow = { label: string; cnt: number };

type CampusPreferencesProps = {
  compact?: boolean;
};

/* ---------- Helpers ---------- */

const weekdayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const orderIdx = (d: string) => weekdayOrder.indexOf(d);

/** small fetch helper – 실패시 그냥 빈 배열 리턴 */
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

export default function CampusPreferences({ compact = false }: CampusPreferencesProps) {
  const [days, setDays] = useState<DayPoint[]>([]);
  const [times, setTimes] = useState<TimePoint[]>([]);
  const [diet, setDiet] = useState<DietPoint[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);

  useEffect(() => {
    (async () => {
      const [d1, d2, d3, v, t] = await Promise.all([
        getJSON<DayPoint[]>("/api/analytics/preferences/popular-days"),
        getJSON<TimePoint[]>("/api/analytics/preferences/popular-time"),
        getJSON<DietPoint[]>("/api/analytics/preferences/dietary"),
        getJSON<VendorRow[]>("/api/analytics/preferences/vendors"),
        getJSON<ThemeRow[]>("/api/analytics/preferences/themes"),
      ]);
      setDays(d1);
      setTimes(d2);
      setDiet(d3);
      setVendors(v);
      setThemes(t);
    })();
  }, []);

  /* ---------- Popular Days (bar) ---------- */

  const daysCfg = useMemo<ChartConfiguration<"bar">>(() => {
    const sorted = [...days].sort(
      (a, b) => orderIdx(a.label) - orderIdx(b.label)
    );

    const labels = sorted.length
      ? sorted.map((x) => (x.label === "Tue" ? "Tues" : x.label))
      : ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    const data = sorted.length
      ? sorted.map((x) => x.cnt)
      : [350, 150, 140, 160, 380, 410, 220];

    const maxIdx = data.reduce(
      (m, v, i, arr) => (v > arr[m] ? i : m),
      0
    );

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: Math.max(1, Math.ceil(Math.max(...data) / 4)),
          },
        },
        x: { grid: { display: false } },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Event volume",
            data,
            borderRadius: 6,
            borderSkipped: false,
            backgroundColor: (ctx) =>
              ctx.dataIndex === maxIdx ? "#ff7a5a" : "#a3bffa",
          },
        ],
      },
      options,
    };
  }, [days]);

  /* ---------- Popular Times (line) ---------- */

  const timesCfg = useMemo<ChartConfiguration<"line">>(() => {
    const labels = times.length
      ? times.map((x) => x.label)
      : ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];

    const data = times.length
      ? times.map((x) => x.cnt)
      : [80, 120, 260, 320, 280, 210, 90];

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        y: { display: false },
        x: { grid: { display: false } },
      },
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0 },
      },
    };

    return {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Popularity",
            data,
            borderColor: "#82a5f5",
            backgroundColor: "rgba(130,165,245,0.12)",
            fill: true,
          },
        ],
      },
      options,
    };
  }, [times]);

  /* ---------- Dietary Restrictions (doughnut) ---------- */

  const dietCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!diet.length) return null;

    const labels = diet.map((d) => d.label);
    const data = diet.map((d) => d.cnt);
    const total = data.reduce((a, b) => a + b, 0);
    const topIdx = data.reduce(
      (m, v, i, arr) => (v > arr[m] ? i : m),
      0
    );

    const topPct = total ? Math.round((data[topIdx] / total) * 100) : 0;
    const center = `${topPct}%\n${labels[topIdx]}`;

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
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
            backgroundColor: [
              "#60A5FA",
              "#3B82F6",
              "#BFDBFE",
              "#93C5FD",
              "#A3BFFA",
            ],
            borderWidth: 0,
          },
        ],
      },
      options,
      plugins: [doughnutCenterText],
    };
  }, [diet]);

  /* ---------- Vendors ---------- */

  const normVendors = useMemo(
    () =>
      vendors.map((v) => ({
        name: (v.label ?? "").trim(),
        cnt: v.cnt ?? 0,
      })),
    [vendors]
  );

  const maxCnt = useMemo(
    () =>
      Math.max(...normVendors.map((v) => v.cnt), 1),
    [normVendors]
  );

  const topVendors = useMemo(
    () =>
      normVendors
        .filter((v) => v.name)
        .map((v) => ({
          ...v,
          score: (v.cnt / maxCnt) * 5, // 0–5 scale
        }))
        .sort((a, b) => b.score - a.score || b.cnt - a.cnt)
        .slice(0, 4),
    [normVendors, maxCnt]
  );

  /* ---------- Themes (chips) ---------- */

  const themeChips = useMemo(
    () =>
      [...themes]
        .sort((a, b) => b.cnt - a.cnt)
        .slice(0, 8)
        .map((t) => t.label.trim()),
    [themes]
  );

  /* ---------- Render ---------- */

  return (
    <div
      className={
        compact
          ? "" // CampusInsights 안에서 wrapper 카드 없음
          : "bg-white rounded-2xl shadow-sm p-6"
      }
    >
      {!compact && (
        <h2 className="text-2xl font-bold mb-6 text-[#1f2b4a]">
          Campus Preferences
        </h2>
      )}

      <div className="bg-[#d4dcf1] rounded-[12px] p-4 space-y-6">
        {/* Row 1: Days + Times */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Popular Days */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-1 text-[#2b3a55]">
              Popular Days
            </h3>
            <p className="text-[11px] text-gray-500 mb-2">
              When people are most likely to attend events.
            </p>
            <div className="h-[190px]">
              <BaseChart config={daysCfg} height={190} />
            </div>
          </div>

          {/* Popular Times */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-1 text-[#2b3a55]">
              Popular Times
            </h3>
            <p className="text-[11px] text-gray-500 mb-2">
              Time windows that tend to perform best.
            </p>
            <div className="h-[190px]">
              <BaseChart config={timesCfg} height={190} />
            </div>
            <p className="mt-2 text-center text-[11px] text-[#2563eb] font-medium">
              Time recommendations
            </p>
          </div>
        </div>

        {/* Row 2: Vendors + Dietary */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Vendors */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-[#2b3a55]">
              Popular Vendors
            </h3>

            {topVendors.length ? (
              <ul className="space-y-2">
                {topVendors.map((v) => {
                  // score(0~1)를 0~5 별점으로 변환
                  const star = (v.score).toFixed(1);
                  return (
                    <li
                      key={v.name}
                      className="w-full px-3 py-2 rounded-lg border border-[#d6d9e7] bg-[#eef3ff] flex items-center justify-between text-xs"
                    >
                      <span className="truncate text-[#1f2937]">
                        {v.name}
                      </span>
                      <span className="flex items-center gap-2 text-[#2b3a55] tabular-nums">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">{star}</span>
                          <span className="text-[#ffb901] text-lg leading-none">
                            ★
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-500">
                          n={v.cnt}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No vendor preferences yet.
              </p>
            )}
          </div>

          {/* Dietary */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-[#2b3a55]">
              Dietary Restrictions
            </h3>
            {dietCfg ? (
              <div className="bg-white rounded-2xl p-2">
                <BaseChart
                  config={dietCfg as ChartConfiguration}
                  height={180}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No dietary data yet.
              </p>
            )}
          </div>
        </div>

        {/* Themes (optional chip row) */}
        {themeChips.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-2 text-[#2b3a55]">
              Popular themes / interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {themeChips.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 rounded-full bg-[#eef3ff] text-[11px] text-[#374151]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
