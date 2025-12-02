"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import BaseChart from "./charts/BaseChart";
import type { ChartConfiguration, ChartOptions, TooltipItem } from "chart.js";

// If you have a typed Database, you can do:
// const supabase = createBrowserClient<Database>(..., ...);
// For now keeping it untyped for simplicity.
function useSupabaseClient() {
  const client = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );
  return client;
}

type PastEvent = {
  id: string;
  registered_count: number | null;
  attended_count: number | null;
  walkins_count: number | null;
  rating_avg: number | null;
  rating_count: number | null;
  start_date: string | null; // 'YYYY-MM-DD'
  food_provided: boolean | null;
  name: string | null;
  location: string | null;
  spent: number | null;
};

function computeAttendanceRate(e: PastEvent): number | null {
  const registered = e.registered_count ?? 0;
  const attended = e.attended_count ?? 0;
  if (registered <= 0) return null;
  return (attended / registered) * 100;
}

export default function LastEventAnalytics() {
  const supabase = useSupabaseClient();

  const [events, setEvents] = useState<PastEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data, error } = await supabase
          .from("past_events")
          .select(
            `
            id,
            registered_count,
            attended_count,
            walkins_count,
            rating_avg,
            rating_count,
            start_date,
            food_provided,
            name,
            location,
            spent
          `
          )
          .gte("start_date", "2025-01-01")
          .lte("start_date", "2025-04-30");

        if (error) throw error;
        setEvents((data ?? []) as PastEvent[]);
      } catch (e: any) {
        console.error(e);
        setErr(e.message ?? "Failed to load event analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  // === 1) Attendance by weekday ===
  const weekdayBarCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    if (!events.length) return null;

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sums = new Array(7).fill(0);
    const counts = new Array(7).fill(0);

    for (const e of events) {
      if (!e.start_date) continue;
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;

      const d = new Date(e.start_date); // assumes YYYY-MM-DD
      const weekday = d.getDay(); // 0=Sun...6=Sat

      sums[weekday] += rate;
      counts[weekday] += 1;
    }

    const avgs = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));

    const options: ChartOptions<"bar"> = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => {
              const value = Number(ctx.raw ?? 0);
              return `${value.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
          title: {
            display: true,
            text: "Avg attendance (%)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Day of week",
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
            label: "Avg attendance (%)",
            data: avgs,
            backgroundColor: "#3B82F6",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  // === 2) Attendance: food vs no food ===
  const foodBarCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    if (!events.length) return null;

    let sumWithFood = 0;
    let cntWithFood = 0;
    let sumWithoutFood = 0;
    let cntWithoutFood = 0;

    for (const e of events) {
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;

      if (e.food_provided) {
        sumWithFood += rate;
        cntWithFood += 1;
      } else {
        sumWithoutFood += rate;
        cntWithoutFood += 1;
      }
    }

    const avgWithFood = cntWithFood ? sumWithFood / cntWithFood : 0;
    const avgWithoutFood = cntWithoutFood ? sumWithoutFood / cntWithoutFood : 0;

    const options: ChartOptions<"bar"> = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => {
              const value = Number(ctx.raw ?? 0);
              return `${value.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
          title: {
            display: true,
            text: "Avg attendance (%)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Food availability",
          },
        },
      },
    };

    return {
      type: "bar",
      data: {
        labels: ["Food provided", "No food"],
        datasets: [
          {
            label: "Avg attendance (%)",
            data: [avgWithFood, avgWithoutFood],
            backgroundColor: ["#22C55E", "#EF4444"],
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  // === Summary stats for the header ===
  const totalEvents = events.length;
  const avgAttendanceOverall = useMemo(() => {
    if (!events.length) return 0;
    let s = 0;
    let c = 0;
    for (const e of events) {
      const r = computeAttendanceRate(e);
      if (r == null) continue;
      s += r;
      c += 1;
    }
    return c ? s / c : 0;
  }, [events]);

  // === UI states ===
  if (err) {
    return (
      <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Last Event Analytics</h2>
        <div className="text-red-600 text-sm">{err}</div>
      </div>
    );
  }

  if (loading) {
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

  if (!events.length) {
    return (
      <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Last Event Analytics</h2>
        <p className="text-gray-500 text-sm">
          No events found between Jan 2025 and Apr 2025.
        </p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm pt-4 px-8 pb-8">
      <h2 className="text-2xl font-bold">Last Event Analytics</h2>
      <div className="space-y-6 bg-[#ffffff] ml-[2px] scale-99 rounded-[10px] pt-4 px-8 pb-8">
      <p className="text-sm text-gray-500 ml-[10px] mt-[5px] mb-4">
        Based on {totalEvents} events between{" "}
        <span className="font-medium">Jan 2025</span> and{" "}
        <span className="font-medium">Apr 2025</span>; Overall average
        attendance:{" "}
        <span className="font-semibold">
          {avgAttendanceOverall.toFixed(1)}%
        </span>
        .
      </p>

      <div className="w-[90%] grid grid-cols-1  ml-[10px] lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Attendance by day of week
          </h3>
          {weekdayBarCfg ? (
            <BaseChart config={weekdayBarCfg} height={320} />
          ) : (
            <p className="text-gray-400 text-sm">Not enough data.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Attendance: food vs no food
          </h3>
          {foodBarCfg ? (
            <BaseChart config={foodBarCfg} height={320} />
          ) : (
            <p className="text-gray-400 text-sm">Not enough data.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
