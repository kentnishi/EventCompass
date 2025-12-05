"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import BaseChart, { doughnutCenterText } from "./charts/BaseChart";
import type {
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// ---------- Supabase client ----------

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

// ---------- Types ----------

type PastEvent = {
  id: string;
  registered_count: number | null;
  attended_count: number | null;
  walkins_count: number | null;
  rating_avg: number | null;
  rating_count: number | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  food_provided: boolean | null;
  giveaways: boolean | null;
  name: string | null;
  description: string | null;
  event_type: string | null;
  location: string | null;
  spent: number | null;
  budget: number | null;
  registration_required: boolean | null;
  committee: string | null;
};

function computeAttendanceRate(e: PastEvent): number | null {
  const registered = e.registered_count ?? 0;
  const attended = e.attended_count ?? 0;
  if (registered <= 0) return null;
  return (attended / registered) * 100;
}

// ---------- Chart & tab types ----------
type AnalyticsTab = "overview" | "attendance" | "budget" | "committees";
type ChartId =
  | "weekday"
  | "timeOfDay"
  | "overBudget"
  | "budgetByType"
  | "attByCommittee"
  | "attByType"
  | "attFoodGiveaways"
  | "committeeBudget"
  | "eventTypeMix";

type SlotState = ChartId | null;

const chartsByTab: Record<AnalyticsTab, ChartId[]> = {
  overview: ["weekday", "timeOfDay"],
  attendance: ["attByCommittee", "attByType", "attFoodGiveaways"],
  budget: ["overBudget", "budgetByType"],
  committees: ["committeeBudget", "eventTypeMix"],
};

const chartMeta: Record<
  ChartId,
  { label: string; subtitle: string }
> = {
  weekday: {
    label: "Attendance by day of week",
    subtitle: "Average attendance rate for each weekday.",
  },
  timeOfDay: {
    label: "Attendance by time of day",
    subtitle: "Morning vs afternoon vs evening vs late night.",
  },
  overBudget: {
    label: "Top over-budget events",
    subtitle: "Events where spending exceeded budget (top 5).",
  },
  budgetByType: {
    label: "Budget usage by event type",
    subtitle: "Average budget used (%) for each event type.",
  },
  attByCommittee: {
    label: "Average attendance by committee",
    subtitle: "Compare committees by average attendance rate.",
  },
  attByType: {
    label: "Attendance by event type",
    subtitle: "Average attendance per event type.",
  },
  attFoodGiveaways: {
    label: "Food / giveaways vs attendance",
    subtitle: "Compare attendance for different combinations.",
  },
  committeeBudget: {
    label: "Committee budget overview",
    subtitle: "Total budget vs spent for each committee.",
  },
  eventTypeMix: {
    label: "Event type mix",
    subtitle: "Distribution of events by type.",
  },
};

// ---------- Main component ----------

export default function LastEventAnalytics() {
  const supabase = useSupabaseClient();

  const [events, setEvents] = useState<PastEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // individual event detail card
  const [showDetails, setShowDetails] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // slot states
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [overviewSlots, setOverviewSlots] = useState<SlotState[]>([
    "weekday",
    "timeOfDay",
  ]);
  const [attendanceSlots, setAttendanceSlots] = useState<SlotState[]>([
    null,
    null,
  ]);
  const [budgetSlots, setBudgetSlots] = useState<SlotState[]>([null, null]);
  const [committeeSlots, setCommitteeSlots] = useState<SlotState[]>([
    null,
    null,
  ]);

  // when selecting chart for a slot
  const [slotPicker, setSlotPicker] = useState<{
    tab: AnalyticsTab;
    index: number;
  } | null>(null);

  const [search, setSearch] = useState("");

  // ---------- data loading ----------

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
            start_time,
            end_date,
            end_time,
            food_provided,
            giveaways,
            name,
            description,
            event_type,
            location,
            spent,
            budget,
            registration_required,
            committee
          `
          )
          .gte("start_date", "2025-01-01")
          .lte("start_date", "2025-04-30")
          .order("start_date", { ascending: true });

        if (error) throw error;

        const rows = (data ?? []) as PastEvent[];
        setEvents(rows);

        if (rows.length && !selectedId) {
          setSelectedId(rows[rows.length - 1].id);
        }
      } catch (e: any) {
        console.error(e);
        setErr(e.message ?? "Failed to load event analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase, selectedId]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId]
  );

  // ---------- Summary statistics ----------

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

  const totalBudget = useMemo(
    () =>
      events.reduce(
        (acc, e) => acc + (e.budget != null && e.budget > 0 ? e.budget : 0),
        0
      ),
    [events]
  );

  const totalSpent = useMemo(
    () =>
      events.reduce(
        (acc, e) => acc + (e.spent != null && e.spent > 0 ? e.spent : 0),
        0
      ),
    [events]
  );

  const overallBudgetUsagePct = totalBudget
    ? (totalSpent / totalBudget) * 100
    : 0;

  // ---------- Overview charts ----------

  const weekdayBarCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    if (!events.length) return null;

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sums = new Array(7).fill(0);
    const counts = new Array(7).fill(0);

    for (const e of events) {
      if (!e.start_date) continue;
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;

      const d = new Date(e.start_date);
      const weekday = d.getDay();
      sums[weekday] += rate;
      counts[weekday] += 1;
    }

    const avgs = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "Avg attendance (%)" },
        },
        x: { title: { display: true, text: "Day of week" } },
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

  const timeOfDayCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    if (!events.length) return null;

    const labels = ["Morning", "Afternoon", "Evening", "Late night"];
    const sums = new Array(4).fill(0);
    const counts = new Array(4).fill(0);

    for (const e of events) {
      if (!e.start_time) continue;
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;

      const [hStr] = e.start_time.split(":");
      const hour = Number(hStr);
      let idx = 0;
      if (hour >= 5 && hour < 12) idx = 0; // Morning
      else if (hour >= 12 && hour < 17) idx = 1; // Afternoon
      else if (hour >= 17 && hour < 22) idx = 2; // Evening
      else idx = 3; // Late night

      sums[idx] += rate;
      counts[idx] += 1;
    }

    const avgs = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "Avg attendance (%)" },
        },
        x: { title: { display: true, text: "Time of day" } },
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
            backgroundColor: "#2f5caa",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  // ---------- Budget charts ----------

  const overBudgetCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    const rows = events
      .map((e) => {
        if (e.budget == null || e.spent == null || e.budget <= 0) return null;
        const overshootPct = (e.spent / e.budget) * 100 - 100;
        if (overshootPct <= 0) return null;
        return {
          id: e.id,
          name: e.name ?? "Untitled",
          overshootPct,
        };
      })
      .filter(Boolean) as { id: string; name: string; overshootPct: number }[];

    if (!rows.length) return null;

    rows.sort((a, b) => b.overshootPct - a.overshootPct);
    const top = rows.slice(0, 5);

    const labels = top.map((r) => r.name);
    const data = top.map((r) => r.overshootPct);

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}% over budget`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "% over budget" },
        },
        y: { title: { display: false, text: "" } },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "% over budget",
            data,
            backgroundColor: "#3076ea",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  const budgetByTypeCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    if (!events.length) return null;
    const map: Record<
      string,
      { spent: number; budget: number }
    > = {};

    for (const e of events) {
      const type = e.event_type ?? "Other";
      if (!map[type]) map[type] = { spent: 0, budget: 0 };
      if (e.budget != null && e.budget > 0) map[type].budget += e.budget;
      if (e.spent != null && e.spent > 0) map[type].spent += e.spent;
    }

    const labels = Object.keys(map);
    if (!labels.length) return null;

    const values = labels.map((k) =>
      map[k].budget ? (map[k].spent / map[k].budget) * 100 : 0
    );

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 150,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "Avg budget used (%)" },
        },
        x: { title: { display: true, text: "Event type" } },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg budget used (%)",
            data: values,
            backgroundColor: "#22C55E",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  // ---------- Attendance charts ----------

  const attByCommitteeCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};

    for (const e of events) {
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;
      const key = e.committee ?? "Other";
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += rate;
      map[key].count += 1;
    }

    const labels = Object.keys(map);
    if (!labels.length) return null;
    const values = labels.map((k) => map[k].sum / map[k].count);

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "Avg attendance (%)" },
        },
        x: { title: { display: true, text: "Committee" } },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg attendance (%)",
            data: values,
            backgroundColor: "#6366F1",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  const attByTypeCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};

    for (const e of events) {
      const rate = computeAttendanceRate(e);
      if (rate == null) continue;
      const key = e.event_type ?? "Other";
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += rate;
      map[key].count += 1;
    }

    const labels = Object.keys(map);
    if (!labels.length) return null;
    const values = labels.map((k) => map[k].sum / map[k].count);

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${Number(ctx.raw ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { callback: (value) => `${value}%` },
          title: { display: true, text: "Avg attendance (%)" },
        },
        x: { title: { display: true, text: "Event type" } },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg attendance (%)",
            data: values,
            backgroundColor: "#0EA5E9",
            borderRadius: 8,
          },
        ],
      },
      options,
    };
  }, [events]);

  const attFoodGiveawaysCfg: ChartConfiguration<"bar"> | null = useMemo(
    () => {
      const map: Record<string, { sum: number; count: number }> = {};

      for (const e of events) {
        const rate = computeAttendanceRate(e);
        if (rate == null) continue;

        const food = e.food_provided ? "Food" : "No food";
        const give = e.giveaways ? "Giveaways" : "No giveaways";
        const key = `${food} / ${give}`;

        if (!map[key]) map[key] = { sum: 0, count: 0 };
        map[key].sum += rate;
        map[key].count += 1;
      }

      const labels = Object.keys(map);
      if (!labels.length) return null;
      const values = labels.map((k) => map[k].sum / map[k].count);

      const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"bar">) =>
                `${Number(ctx.raw ?? 0).toFixed(1)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: { callback: (value) => `${value}%` },
            title: { display: true, text: "Avg attendance (%)" },
          },
          x: { title: { display: true, text: "Food / giveaways" } },
        },
      };

      return {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Avg attendance (%)",
              data: values,
              backgroundColor: "#41b8d5",
              borderRadius: 8,
            },
          ],
        },
        options,
      };
    },
    [events]
  );

  // ---------- Committees / types charts ----------

  const committeeBudgetCfg: ChartConfiguration<"bar"> | null = useMemo(() => {
    const map: Record<
      string,
      { spent: number; budget: number }
    > = {};

    for (const e of events) {
      const key = e.committee ?? "Other";
      if (!map[key]) map[key] = { spent: 0, budget: 0 };
      if (e.budget != null && e.budget > 0) map[key].budget += e.budget;
      if (e.spent != null && e.spent > 0) map[key].spent += e.spent;
    }

    const labels = Object.keys(map);
    if (!labels.length) return null;

    const spent = labels.map((k) => map[k].spent);
    const remaining = labels.map((k) =>
      Math.max(map[k].budget - map[k].spent, 0)
    );

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: "Committee" },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: "Budget" },
        },
      },
    };

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Spent",
            data: spent,
            backgroundColor: "#3076ea",
          },
          {
            label: "Remaining",
            data: remaining,
            backgroundColor: "#8eb8ff",
          },
        ],
      },
      options,
    };
  }, [events]);

  const eventTypeMixCfg: ChartConfiguration<"pie"> | null = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of events) {
      const type = e.event_type ?? "Other";
      map[type] = (map[type] ?? 0) + 1;
    }

    const labels = Object.keys(map);
    if (!labels.length) return null;

    const data = labels.map((k) => map[k]);

    const options: ChartOptions<"pie"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    };

    return {
      type: "pie",
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
              "#6a92f9",
              "#2d8bba",
              "#41b8d5",
            ],
          },
        ],
      },
      options,
    };
  }, [events]);

  // ---------- selected donuts ----------

  const attendanceDonutCfg: ChartConfiguration<"doughnut"> | null =
    useMemo(() => {
      if (!selectedEvent) return null;
      const registered = selectedEvent.registered_count ?? 0;
      const attended = selectedEvent.attended_count ?? 0;
      if (registered <= 0) return null;

      const noShow = Math.max(registered - attended, 0);
      const attendancePct = (attended / Math.max(registered, 1)) * 100;

      const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"doughnut">) => {
                const value = Number(ctx.raw ?? 0);
                return `${ctx.label}: ${value} (${(
                  (value / Math.max(registered, 1)) *
                  100
                ).toFixed(1)}%)`;
              },
            },
          },
          doughnutCenterText: {
            text: `${attendancePct.toFixed(1)}%\nAttendance`,
          },
        } as any,
      };

      return {
        type: "doughnut",
        data: {
          labels: ["Attended", "No Show"],
          datasets: [
            {
              data: [attended, noShow],
              backgroundColor: ["#3B82F6", "#8eb8ff"],
              borderWidth: 0,
            },
          ],
        },
        options,
        plugins: [doughnutCenterText],
      };
    }, [selectedEvent]);

  const budgetDonutCfg: ChartConfiguration<"doughnut"> | null =
    useMemo(() => {
      if (!selectedEvent) return null;
      if (selectedEvent.budget == null || selectedEvent.spent == null)
        return null;

      const budget = selectedEvent.budget;
      const spent = selectedEvent.spent;
      const remaining = Math.max(budget - spent, 0);
      const spentPct = (spent / Math.max(budget, 1)) * 100;

      const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"doughnut">) => {
                const value = Number(ctx.raw ?? 0);
                return `${ctx.label}: $${value.toFixed(0)} (${(
                  (value / Math.max(budget, 1)) *
                  100
                ).toFixed(1)}%)`;
              },
            },
          },
          doughnutCenterText: {
            text: `${spentPct.toFixed(1)}%\nBudget used`,
          },
        } as any,
      };

      return {
        type: "doughnut",
        data: {
          labels: ["Spent", "Remaining"],
          datasets: [
            {
              data: [spent, remaining],
              backgroundColor: ["#41b8d5", "#3076ea"],
              borderWidth: 0,
            },
          ],
        },
        options,
        plugins: [doughnutCenterText],
      };
    }, [selectedEvent]);

  // ---------- event selection filter ----------

  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter((e) => (e.name ?? "").toLowerCase().includes(q));
  }, [events, search]);

  const handleSelectEvent = (id: string) => {
    setSelectedId(id);
    setShowDetails(true);
  };

  // ---------- Slot helpers ----------

  const getConfigForId = (id: ChartId) => {
    switch (id) {
      case "weekday":
        return weekdayBarCfg;
      case "timeOfDay":
        return timeOfDayCfg;
      case "overBudget":
        return overBudgetCfg;
      case "budgetByType":
        return budgetByTypeCfg;
      case "attByCommittee":
        return attByCommitteeCfg;
      case "attByType":
        return attByTypeCfg;
      case "attFoodGiveaways":
        return attFoodGiveawaysCfg;
      case "committeeBudget":
        return committeeBudgetCfg;
      case "eventTypeMix":
        return eventTypeMixCfg;
      default:
        return null;
    }
  };

  const getSlotsForTab = (t: AnalyticsTab): [SlotState[], (s: SlotState[]) => void] => {
    switch (t) {
      case "overview":
        return [overviewSlots, setOverviewSlots];
      case "attendance":
        return [attendanceSlots, setAttendanceSlots];
      case "budget":
        return [budgetSlots, setBudgetSlots];
      case "committees":
        return [committeeSlots, setCommitteeSlots];
    }
  };

  const openSlotPicker = (t: AnalyticsTab, index: number) =>
    setSlotPicker({ tab: t, index });

  const closeSlotPicker = () => setSlotPicker(null);

  const assignChartToSlot = (chartId: ChartId) => {
    if (!slotPicker) return;
    const [slots, setSlots] = getSlotsForTab(slotPicker.tab);
    const next = [...slots];
    next[slotPicker.index] = chartId;
    setSlots(next);
    closeSlotPicker();
  };

  const clearSlot = (t: AnalyticsTab, index: number) => {
    const [slots, setSlots] = getSlotsForTab(t);
    const next = [...slots];
    next[index] = null;
    setSlots(next);
  };

  // ---------- UI states ----------

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

  // ---------- Rendor ----------

  const [currentSlots] = getSlotsForTab(tab);

  return (
    <>
      <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-1">Last Event Analytics</h2>
        <p className="text-sm text-gray-500 mb-4">
          Based on {totalEvents} events between{" "}
          <span className="font-medium">Jan 2025</span> and{" "}
          <span className="font-medium">Apr 2025</span>; Overall average
          attendance:{" "}
          <span className="font-semibold">
            {avgAttendanceOverall.toFixed(1)}%
          </span>{" "}
          · Budget usage:{" "}
          <span className="font-semibold">
            {overallBudgetUsagePct.toFixed(1)}%
          </span>
          .
        </p>


        {/* Tabs */}
        <div className="flex gap-2 text-xs mb-3">
          {(["overview", "attendance", "budget", "committees"] as AnalyticsTab[]).map(
            (key) => {
              const labelMap: Record<AnalyticsTab, string> = {
                overview: "Overview",
                attendance: "Attendance",
                budget: "Budget",
                committees: "Committees",
              };
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={[
                    "rounded-full px-3 py-1 border text-xs font-medium",
                    active
                      ? "bg-[#cfe0ff] border-[#b8c9f2] text-[#1f2b4a]"
                      : "bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4ff]",
                  ].join(" ")}
                >
                  {labelMap[key]}
                </button>
              );
            }
          )}
        </div>

        {/* Chart slots (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentSlots.map((slot, i) => {
            if (!slot) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => openSlotPicker(tab, i)}
                  className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-[#d1d5db] bg-[#eef3ff] text-sm text-[#6b7280] hover:bg-[#f3f4ff]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">+</span>
                    <span>Add chart</span>
                  </div>
                </button>
              );
            }

            const meta = chartMeta[slot];
            const cfg = getConfigForId(slot);

            return (
              <div
                key={i}
                className="rounded-2xl border border-[#e5e7eb] bg-[#eef3ff] p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">
                      {meta.label}
                    </h3>
                    <p className="text-[11px] text-[#6b7280]">
                      {meta.subtitle}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openSlotPicker(tab, i)}
                      className="text-[10px] rounded-full border border-[#d1d5db] px-2 py-0.5 text-[#4b5563] hover:bg-white"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => clearSlot(tab, i)}
                      className="text-[10px] rounded-full border border-[#fee2e2] px-2 py-0.5 text-[#b91c1c] hover:bg-[#eef3ff]"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="w-full h-[210px]">
                  {cfg ? (
                    <BaseChart config={cfg as any} height={210} />
                  ) : (
                    <p className="text-xs text-gray-400 mt-6">
                      Not enough data to render this chart.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* individual event analytics toggle button */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cfe0ff] bg-[#eef3ff] px-3 py-1 text-xs font-medium text-[#2d4da3] hover:bg-[#e0e8ff]"
        >
          <span className="text-lg leading-none">
            {showDetails ? "−" : "+"}
          </span>
          {showDetails ? "Hide individual event analytics card" : "View individual event analytics card"}
        </button>

        {showDetails && (
          <div className="mt-6 rounded-2xl bg-[#eef3ff] px-4 py-4 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Event analytics
                </h3>
                <p className="text-s mt-2 font-extrabold text-[#2b2f3a]">
                  {selectedEvent
                    ? selectedEvent.name ?? "Untitled event"
                    : "Select an event to see detailed analytics."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSlotPicker(null);
                  handleSelectEvent(selectedId ?? "");
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  setSlotPicker(null);
                  setSearch("");
                }}
                className="sr-only"
              >
                invisible
              </button>
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setSlotPicker(null)}
                className="hidden"
              />
            </div>

            {selectedEvent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* donut chart */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="h-[200px]">
                    <h4 className="text-sm font-semibold mb-1">
                      Attendance breakdown
                    </h4>
                    {attendanceDonutCfg ? (
                      <BaseChart config={attendanceDonutCfg as any} height={200} />
                    ) : (
                      <p className="text-xs text-gray-500 mt-4">
                        No registration data for this event.
                      </p>
                    )}
                  </div>
                  <div className="h-[200px]">
                    <h4 className="text-sm font-semibold mb-1">
                      Budget vs spent
                    </h4>
                    {budgetDonutCfg ? (
                      <BaseChart config={budgetDonutCfg as any} height={200} />
                    ) : (
                      <p className="text-xs text-gray-500 mt-4">
                        No budget/spending data for this event.
                      </p>
                    )}
                  </div>
                </div>

                {/* text details */}
                <div className="text-xs text-[#2b3a55] space-y-2 md:col-span-2">
                  {selectedEvent.description && (
                    <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <span className="font-semibold">Type</span>
                    <span>{selectedEvent.event_type ?? "—"}</span>

                    <span className="font-semibold">Date</span>
                    <span>
                      {selectedEvent.start_date
                        ? new Date(
                            `${selectedEvent.start_date}T${
                              selectedEvent.start_time ?? "00:00:00"
                            }`
                          ).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "TBD"}
                    </span>

                    <span className="font-semibold">Location</span>
                    <span>{selectedEvent.location ?? "TBD"}</span>

                    <span className="font-semibold">Committee</span>
                    <span>{selectedEvent.committee ?? "—"}</span>

                    <span className="font-semibold">Registration</span>
                    <span>
                      {selectedEvent.registration_required == null
                        ? "—"
                        : selectedEvent.registration_required
                        ? "Required"
                        : "Not required"}
                    </span>

                    <span className="font-semibold">Registered</span>
                    <span>{selectedEvent.registered_count ?? 0}</span>

                    <span className="font-semibold">Attended</span>
                    <span>{selectedEvent.attended_count ?? 0}</span>

                    <span className="font-semibold">Rating</span>
                    <span>
                      {selectedEvent.rating_avg != null
                        ? `${selectedEvent.rating_avg.toFixed(1)} (${
                            selectedEvent.rating_count ?? 0
                          })`
                        : "No ratings"}
                    </span>

                    <span className="font-semibold">Budget</span>
                    <span>
                      {selectedEvent.budget != null
                        ? `$${selectedEvent.budget.toFixed(0)}`
                        : "—"}
                    </span>

                    <span className="font-semibold">Spent</span>
                    <span>
                      {selectedEvent.spent != null
                        ? `$${selectedEvent.spent.toFixed(0)}`
                        : "—"}
                    </span>

                    <span className="font-semibold">Food provided</span>
                    <span>
                      {selectedEvent.food_provided == null
                        ? "—"
                        : selectedEvent.food_provided
                        ? "Yes"
                        : "No"}
                    </span>

                    <span className="font-semibold">Giveaways</span>
                    <span>
                      {selectedEvent.giveaways == null
                        ? "—"
                        : selectedEvent.giveaways
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Select an event from the list below to see analytics.
              </p>
            )}

            {/* event list */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-[#111827] mb-1">
                Past events
              </h4>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full mb-2 rounded-md border border-[#d6d9e7] px-2 py-1 text-xs"
              />
              <div className="max-h-48 overflow-y-auto rounded-md border border-[#eaecf1] bg-white">
                {filteredEvents.map((e) => {
                  const dtStr = e.start_date
                    ? new Date(
                        `${e.start_date}T${e.start_time ?? "00:00:00"}`
                      ).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "TBD";
                  const active = e.id === selectedId;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => handleSelectEvent(e.id)}
                      className={[
                        "w-full text-left px-3 py-2 text-xs border-b border-[#eaecf1]",
                        active
                          ? "bg-[#e0ebff] text-[#1f2937]"
                          : "bg-transparent text-[#4b5563] hover:bg-[#f3f4ff]",
                      ].join(" ")}
                    >
                      <div className="truncate">{e.name ?? "Untitled event"}</div>
                      <div className="text-[10px] text-[#9ca3af]">
                        {dtStr} • {e.location ?? "TBD"}
                      </div>
                    </button>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <div className="px-3 py-3 text-xs text-gray-500">
                    No events match your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* chart selection model */}
      {slotPicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeSlotPicker}
          />
          <div className="relative z-50 w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1f2b4a]">
                Choose a chart
              </h3>
              <button
                type="button"
                onClick={closeSlotPicker}
                className="text-sm text-[#6b7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-[#6b7280] mb-2">
              Select which chart to show in this slot.
            </p>
            <div className="max-h-72 overflow-y-auto">
              {chartsByTab[slotPicker.tab].map((id) => {
                const meta = chartMeta[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => assignChartToSlot(id)}
                    className="w-full text-left mb-2 rounded-lg border border-[#e5e7eb] bg-[#eef3ff] px-3 py-2 text-xs hover:bg-[#eef2ff]"
                  >
                    <div className="font-semibold text-[#111827]">
                      {meta.label}
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      {meta.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
