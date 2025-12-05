"use client";

import React, { useState } from "react";
import CampusPreferences from "@/components/Campus/CampusPreferences";
import CampusDemographics from "@/components/Campus/CampusDemographics"; // 이건 나중에 만들어도 됨

type TabId = "preferences" | "demographics";

const TABS: { id: TabId; label: string }[] = [
  { id: "preferences", label: "Campus preferences" },
  { id: "demographics", label: "Campus demographics" },
];

export default function CampusInsights() {
  const [active, setActive] = useState<TabId>("preferences");

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      {/* 헤더 + 탭 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2b4a]">Campus Insights</h2>
          <p className="text-xs text-gray-500 mt-1">
            See what the campus prefers and who is attending UPB events.
          </p>
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

      {/* 탭 내용 */}
      <div className="mt-2">
        {active === "preferences" ? (
          // compact 모드로 캠퍼스 프리퍼런스 내용만 렌더
          <CampusPreferences compact />
        ) : (
          // 아직 CampusDemographics 안 만들었으면
          // 임시로 simple placeholder 넣어도 됨
          <CampusDemographics />
        )}
      </div>
    </section>
  );
}
