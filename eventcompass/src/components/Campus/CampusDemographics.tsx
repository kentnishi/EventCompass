"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart, { doughnutCenterText } from "@/components/charts/BaseChart";
import type {
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";

/* ---------- Types ---------- */

type DemoPoint = {
  label: string;
  count: number;
  percent: number;
};

type RawBucket = {
  label: string;
  count: number;
};

type DietPoint = {
  label: string;
  cnt: number;
};

/* ---------- Helpers ---------- */

async function getJSON<T>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  } catch (e) {
    console.error("demographics fetch error", e);
    return [] as unknown as T;
  }
}

/* ---------- Component ---------- */

export default function CampusDemographics() {
  const [yearData, setYearData] = useState<DemoPoint[]>([]);
  const [majorData, setMajorData] = useState<DemoPoint[]>([]);
  const [regionData, setRegionData] = useState<DemoPoint[]>([]);
  const [dietData, setDietData] = useState<DietPoint[]>([]);

  useEffect(() => {
    (async () => {
      const [years, majors, regionsRaw, dietRaw] = await Promise.all([
        getJSON<DemoPoint[]>("/api/analytics/demographics/year"),
        getJSON<DemoPoint[]>("/api/analytics/demographics/major"),
        getJSON<RawBucket[]>("/api/analytics/demographics/region"),
        getJSON<DietPoint[]>("/api/analytics/preferences/dietary"),
      ]);

      setYearData(years);
      setMajorData(majors);

      const totalRegion = regionsRaw.reduce(
        (sum, r) => sum + (r.count ?? 0),
        0,
      );
      const regions: DemoPoint[] = regionsRaw.map((r) => ({
        label: r.label,
        count: r.count,
        percent: totalRegion ? (r.count / totalRegion) * 100 : 0,
      }));
      setRegionData(regions);

      setDietData(dietRaw);
    })();
  }, []);

  /* ---------- Class years (bar) ---------- */

  const yearCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!yearData.length) return null;

    const labels = yearData.map((d) => d.label);
    const data = yearData.map((d) => d.percent);

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => {
              const i = ctx.dataIndex;
              const pt = yearData[i];
              const pct = Number(ctx.raw ?? 0).toFixed(1);
              return `${pt.label}: ${pct}% (${pt.count} responses)`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 40,
          ticks: {
            callback: (v) => `${v}%`,
          },
          title: {
            display: true,
            text: "Share of respondents",
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
            label: "% of respondents",
            data,
            backgroundColor: "#a8c0ff",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [yearData]);

  /* ---------- Majors (horizontal bar, top 8) ---------- */

  const majorCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!majorData.length) return null;

    const sorted = [...majorData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const labels = sorted.map((d) => d.label);
    const data = sorted.map((d) => d.count);
    const max = Math.max(...data);

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: max ? max * 1.1 : 5,
          ticks: {
            stepSize: Math.max(1, Math.round(max / 4)),
          },
          title: { display: true, text: "Number of respondents" },
        },
        y: {
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => {
              const c = sorted[ctx.dataIndex];
              return `${c.count} students (${c.percent.toFixed(1)}%)`;
            },
          },
        },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Responses",
            data,
            backgroundColor: "#a8c0ff",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [majorData]);

  /* ---------- Region (doughnut) ---------- */

  const regionCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!regionData.length) return null;

    const labels = regionData.map((d) => d.label);
    const data = regionData.map((d) => d.percent);
    const topIdx = data.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
    const topLabel = labels[topIdx];
    const topPct = Number(data[topIdx]).toFixed(1);

    const centerText = `${topPct}%\n${topLabel}`;

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10 },
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"doughnut">) => {
              const i = ctx.dataIndex;
              const pt = regionData[i];
              const pct = Number(ctx.raw ?? 0).toFixed(1);
              return `${pt.label}: ${pct}% (${pt.count} responses)`;
            },
          },
        },
        doughnutCenterText: { text: centerText } as any, 
      },
      cutout: "60%",
    };

    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "% of respondents",
            data,
            backgroundColor: [
              "#2d8bba",
              "#41b8d5",
              "#BFDBFE",
              "#89cec6",
              "#8EE7E7",
              "#C7E2FF",
              "#A3BFFA", 
        ],
          },
        ],
        
      },
      options,
    };
  }, [regionData]);

  /* ---------- Dietary Restrictions (doughnut) ---------- */

  const dietCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!dietData.length) return null;

    const labels = dietData.map((d) => d.label);
    const data = dietData.map((d) => d.cnt);
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
              "#a8c0ff",
              "#6ce5e8",
              "#89cec6",
              "#A3BFFA", 
              "#2d8bba",
            ],
            borderWidth: 0,
          },
        ],
      },
      options,
      plugins: [doughnutCenterText],
    };
  }, [dietData]);

  /* ---------- Render ---------- */

  return (
    <div className="bg-[#d4dcf1] rounded-[12px] p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class years */}
          <div className="border bg-white border-[#eaecf1] rounded-2xl p-4">
            <h4 className="text-sm font-semibold mb-1">
              Class Years
            </h4>
            <p className="text-[11px] text-[#7a86a8] mb-3">
              Which class years are most represented in the survey.
            </p>
            <div className="h-[220px]">
              {yearCfg ? (
                <BaseChart config={yearCfg} height={220} />
              ) : (
                <p className="text-xs text-gray-400 mt-6">
                  No class year data yet.
                </p>
              )}
            </div>
          </div>

          {/* Majors */}
          <div className="border bg-white border-[#eaecf1] rounded-2xl p-4">
            <h4 className="text-sm font-semibold mb-1">
              Majors / Fields
            </h4>
            <p className="text-[11px] text-[#7a86a8] mb-3">
              High-level breakdown of academic areas (top 8).
            </p>
            <div className="h-[220px]">
              {majorCfg ? (
                <BaseChart config={majorCfg} height={220} />
              ) : (
                <p className="text-xs text-gray-400 mt-6">
                  No major/field data yet.
                </p>
              )}
            </div>
          </div>

          {/* Region */}
          <div className="border bg-white border-[#eaecf1] rounded-2xl p-4">
            <h4 className="text-sm font-semibold mb-1">
              Where Students Are From
            </h4>
            <p className="text-[11px] text-[#7a86a8] mb-3">
              Ohio vs New York vs California vs  other U.S. states vs International respondents.
            </p>
            <div className="h-[240px]">
              {regionCfg ? (
                <BaseChart config={regionCfg} height={240} />
              ) : (
                <p className="text-xs text-gray-400 mt-6">
                  No region data yet.
                </p>
              )}
            </div>
          </div>

          {/* Dietary */}
          <div className="border bg-white border-[#eaecf1] rounded-2xl p-4">
            <h4 className="text-sm font-semibold  mb-1">
              Dietary Needs
            </h4>
            <p className="text-[11px] text-[#7a86a8] mb-3">
              Proportion of respondents with specific dietary restrictions.
            </p>
            <div className="h-[240px]">
              {dietCfg ? (
                <BaseChart config={dietCfg as ChartConfiguration} height={240} />
              ) : (
                <p className="text-xs text-gray-400 mt-6">
                  No dietary information yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
