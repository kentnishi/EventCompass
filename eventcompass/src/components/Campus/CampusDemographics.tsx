"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseChart from "@/components/charts/BaseChart";
import type {
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";

type DemoPoint = {
  label: string;
  count: number;
  percent: number; // 0–100
};

type RawBucket = {
  label: string;
  count: number;
};

async function getJSON<T>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  } catch (e) {
    console.error("demographics fetch error", e);
    // 실패하면 빈 배열 반환해서 UI 터지지 않게
    return [] as unknown as T;
  }
}

export default function CampusDemographics() {
  const [yearData, setYearData] = useState<DemoPoint[]>([]);
  const [majorData, setMajorData] = useState<DemoPoint[]>([]);
  const [regionData, setRegionData] = useState<DemoPoint[]>([]);

  useEffect(() => {
    (async () => {
      const [years, majors, regionsRaw] = await Promise.all([
        getJSON<DemoPoint[]>("/api/analytics/demographics/year"),
        getJSON<DemoPoint[]>("/api/analytics/demographics/major"),
        getJSON<RawBucket[]>("/api/analytics/demographics/region"),
      ]);

      setYearData(years);
      setMajorData(majors);

      // region API는 {label, count}만 주니까 여기서 percent 계산
      const total = regionsRaw.reduce((sum, r) => sum + (r.count ?? 0), 0);
      const regions: DemoPoint[] = regionsRaw.map((r) => ({
        label: r.label,
        count: r.count,
        percent: total ? (r.count / total) * 100 : 0,
      }));
      setRegionData(regions);
    })();
  }, []);

  // ---- Class years bar chart ----
  const yearCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!yearData.length) return null;

    const labels = yearData.map((d) => d.label);
    const data = yearData.map((d) => d.percent); // 퍼센트 그대로 사용 (0–100)

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
            backgroundColor: "#A3BFFA",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [yearData]);

  // ---- Majors bar chart (top 8, horizontal) ----
  const majorCfg = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!majorData.length) return null;

    const sorted = [...majorData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const labels = sorted.map((d) => d.label);
    const data = sorted.map((d) => d.count);
    const max = Math.max(...data);

    const options: ChartOptions<"bar"> = {
      indexAxis: "y", // 가로 막대
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
            backgroundColor: "#818CF8",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options,
    };
  }, [majorData]);

  // ---- Region donut chart ----
  const regionCfg = useMemo<ChartConfiguration<"doughnut"> | null>(() => {
    if (!regionData.length) return null;

    const labels = regionData.map((d) => d.label);
    const data = regionData.map((d) => d.percent);

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
          },
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
            // 색은 BaseChart에서 기본 팔레트 쓰고 있으면 생략해도 됨
          },
        ],
      },
      options,
    };
  }, [regionData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
      <h3 className="text-lg font-semibold text-[#111827]">
        Campus Demographics
      </h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        Based on the most recent UPB campus survey.
      </p>

      <p className="text-[11px] text-gray-500 mb-3">
        Snapshot of who we&apos;re hearing from across class years, majors, and
        where students are from.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class years */}
        <div className="border border-[#eaecf1] rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-[#111827] mb-1">
            Class years
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            Quick snapshot of which class years are most represented in the
            survey.
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
        <div className="border border-[#eaecf1] rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-[#111827] mb-1">
            Majors / fields
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            High-level breakdown of academic areas students come from (top 8).
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

        {/* Region / where students are from */}
        <div className="border border-[#eaecf1] rounded-2xl p-4 md:col-span-2">
          <h4 className="text-sm font-semibold text-[#111827] mb-1">
            Where students are from
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            Ohio vs other U.S. states vs international respondents.
          </p>
          <div className="h-[260px]">
            {regionCfg ? (
              <BaseChart config={regionCfg} height={260} />
            ) : (
              <p className="text-xs text-gray-400 mt-6">
                No region data yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
