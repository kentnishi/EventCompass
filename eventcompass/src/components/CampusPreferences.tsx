"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "./charts/BaseChart";
import type { ChartConfiguration, ChartOptions } from "chart.js";

type DayPoint = { label: string; cnt: number };
type TimePoint = { label: string; cnt: number };
type DietPoint = { label: string; cnt: number };
type VendorRow = {
  name?: string;       // API may send name
  label?: string;      // or label
  vendor?: string;     // or vendor
  avg?: number;        // or rating on 0–1 or 0–5 scale
  rating?: number;
  count?: number;      // or n
  n?: number;
};
type ThemeRow = { label: string; cnt: number };

const weekdayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const orderIdx = (d: string) => weekdayOrder.indexOf(d);

async function getJSON<T>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  } catch {
    return [] as unknown as T;
  }
}

export default function CampusPreferences() {
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

  // Popular Days (bar)
  const daysCfg = useMemo<ChartConfiguration>(() => {
    const sorted = [...days].sort((a, b) => orderIdx(a.label) - orderIdx(b.label));
    const labels = sorted.length
      ? sorted.map((x) => (x.label === "Tue" ? "Tues" : x.label))
      : ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = sorted.length ? sorted.map((x) => x.cnt) : [150, 300, 400, 550, 350, 100, 80];
    const maxIdx = data.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);

    return {
      type: "bar",
      data: { labels, datasets: [{ data, label: "Event Volume", borderRadius: 4, borderSkipped: false, backgroundColor: (ctx: any) => (ctx.dataIndex === maxIdx ? "#FF7A5A" : "#A3BFFA") }] },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: Math.max(1, Math.ceil(Math.max(...data) / 4)) } },
          x: { grid: { display: false } },
        },
        plugins: { tooltip: { enabled: true } },
      },
    };
  }, [days]);

  // Popular Times (line)
  const timesCfg = useMemo<ChartConfiguration>(() => {
    const labels = times.length ? times.map((x) => x.label) : ["8am", "", "2pm", "", "8pm", "", "2am"];
    const data = times.length ? times.map((x) => x.cnt) : [50, 80, 250, 320, 450, 150, 40];
    return {
      type: "line",
      data: { labels, datasets: [{ label: "Popularity", data, borderColor: "#82a5f5", backgroundColor: "rgba(130,165,245,0.10)", fill: true, tension: 0.4, pointRadius: 0 }] },
      options: { scales: { y: { display: false }, x: { grid: { display: false } } }, plugins: { tooltip: { enabled: true } } },
    };
  }, [times]);

  // Dietary (doughnut)
  const dietCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!diet.length) return null;
    const labels = diet.map((d) => d.label);
    const data = diet.map((d) => d.cnt);
    const total = data.reduce((a, b) => a + b, 0);
    const topIdx = data.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
    const center = `${total ? Math.round((data[topIdx] / total) * 100) : 0}%\n${labels[topIdx]}`;

    const opts: ChartOptions<"doughnut"> = {
      cutout: "70%",
      plugins: { doughnutCenterText: { text: center } as any },
    };

    return {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: ["#60A5FA", "#3B82F6", "#BFDBFE", "#93C5FD", "#A3BFFA"], borderWidth: 0 }] },
      options: opts,
      plugins: [doughnutCenterText],
    };
  }, [diet]);

  const normVendors = useMemo(() => {
    return vendors.map((v) => ({
      name: (v.name ?? (v as any).label ?? (v as any).vendor ?? "").trim(),
      // prefer avg, then rating
      avg: Number(v.avg ?? (v as any).rating ?? 0),
      count: Number(v.count ?? (v as any).n ?? 0),
    }));
  }, [vendors]);

  // Vendors – use your API output, fallback to empty
  const topVendors = useMemo(() => {
    return normVendors
      .filter((v) => v.name) // drop empties
      .sort((a, b) => (b.avg - a.avg) || (b.count - a.count))
      .slice(0, 4);
  }, [normVendors]);

  // Themes – use exactly what /api/analytics/themes returns
  const themeChips = useMemo(
    () =>
      [...themes]
        .sort((a, b) => b.cnt - a.cnt)
        .slice(0, 8)
        .map(t => t.label.trim()),
    [themes]
  );

  return (
    <div className="lg:col-span-2 bg-[gray-100]/60 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Campus Preferences</h2>

      <div className="space-y-6 bg-[#d4dcf1] scale-99 rounded-[10px]">
        {/* Popular Days */}
        <div className="scale-95 items-center bg-white p-4 rounded-lg">
          <h3 className="font-semibold mb-1">Popular Days</h3>
            <h4 className="bg-[white] rounded-[10px]"><BaseChart config={daysCfg} height={192} /></h4>
        </div>

        {/* Popular Times */}
        <div className="scale-95 items-center bg-white p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Popular Times</h3>
            <h4 className="bg-[white] rounded-[10px]"><BaseChart config={timesCfg} height={192} />
              <p className="text-center text-xs text-blue-500 mt-2 font-medium">Time Recommendations</p>
            </h4>
        </div>

        {/* Vendors + Dietary */}
        <div className="scale-95 items-center p-4 grid grid-cols-2 md:grid-cols-2 gap-6">
          {/* Vendors */}
          <div className="col-span-1.2 bg-white rounded-2xl items-start ">
            <h3 className="font-semibold mb-4 text-[#2b3a55]">Popular Vendors</h3>
            <h4 className="item-left scale-98">

            {topVendors.length ? (
              <h5 className="list-none m-0">
                {topVendors.map((v) => {
                  // API gives 0–1; show as 0–5 like the mock
                  const fiveStar = (v.avg ?? 0) * 5;
                  const display = isFinite(fiveStar) && fiveStar > 0 ? fiveStar.toFixed(1) : "—";
                  return (
                    <li
                      key={v.name}
                      className="w-full px-4 py-2 w-full rounded-[10px] 
                                border border-[#d6d9e7] bg-[#eef3ff]
                                 flex justify-between"
                    >
                      <span className="truncate">
                        {v.name}
                      </span>

                      <span className="flex  gap-1 text-[#2b3a55] tabular-nums">
                        <span className="font-semibold rounded-[25px]">{display}</span>
                        {(v.avg ?? 0).toFixed(1)}
                        <span className="text-[#ffb901] text-lg leading-none">★</span>
                      </span>
                    </li>
                  );
                })}
              </h5>
            ) : (
              <p className="text-sm text-gray-500">No vendor ratings yet.</p>
            )}</h4>
          </div>

          {/* Dietary */}
          <div className="col-span-1.2 p-4 rounded-5xl">
            <h3 className="font-semibold mb-2 text-[#2b3a55]">Dietary Restrictions</h3>
            {dietCfg ? (
              <div className="bg-[#ffffff] rounded-[25px] p-3">
                <BaseChart config={dietCfg} height={180} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No dietary data yet.</p>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}