"use client";

import React, { useState } from "react";
import CampusPreferences from "@/components/Campus/CampusPreferences";
import CampusDemographics from "@/components/Campus/CampusDemographics";
import BudgetSensitivity from "@/components/Campus/BudgetSensitivity";
import EngagementInsights from "@/components/Campus/EngagementInsights";

type TabId = "preferences" | "demographics" | "budget" | "engagement";

const TABS: { id: TabId; label: string }[] = [
  { id: "preferences", label: "Campus preferences" },
  { id: "demographics", label: "Campus demographics" },
  { id: "budget", label: "Budget / price sensitivity" },
  { id: "engagement", label: "Engagement & community" },
];

export default function CampusInsights() {
  const [active, setActive] = useState<TabId>("preferences");

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Campus Insights</h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-1 py-1">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={[
                  "px-3 py-1 text-xs rounded-full font-medium transition-colors",
                  isActive
                    ? "bg-white text-[#2d4da3] shadow-sm"
                    : "bg-transparent text-[#6b7280] hover:text-[#111827]",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {active === "preferences" && <CampusPreferences compact />}
        {active === "demographics" && <CampusDemographics />}
        {active === "budget" && <BudgetSensitivity />}
        {active === "engagement" && <EngagementInsights />}
      </div>
    </section>
  );
}
