"use client";
import React from "react";
import BaseChart, { doughnutCenterText } from "./charts/BaseChart";
import { ChartConfiguration, ChartOptions } from "chart.js";

export default function LastEventAnalytics() {
  const attendanceOptions: ChartOptions<"doughnut"> = {
    cutout: "75%",
    plugins: {
      doughnutCenterText: { text: "77% Attendance\nTotal: 70" },
    },
  };

  const attendanceCfg: ChartConfiguration<"doughnut"> = {
    type: "doughnut",
    data: {
      labels: ["Attended", "Walk-ins", "No Show"],
      datasets: [
        {
          data: [58.5, 23.5, 18],
          backgroundColor: ["#3B82F6", "#93C5FD", "#E5E7EB"],
          borderWidth: 0,
        },
      ],
    },
    options: attendanceOptions,
    plugins: [doughnutCenterText],
  };


  return (
    <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Last Event Analytics</h2>

      <div className="text-center">
        <h3 className="text-3xl font-bold tracking-wide">MOVIE & DINE</h3>
        <div className="flex justify-center items-center my-2 text-yellow-500">
          {"★★★★★".split("").map((s, i) => <span key={i} className="text-2xl">★</span>)}
          <span className="text-gray-500 font-medium ml-2">(9)</span>
        </div>
      </div>

      <div className="my-6">
        <BaseChart config={attendanceCfg} height={320} />
      </div>

      <div className="text-center my-6">
        <p className="text-3xl font-bold">Fri, 9/5/25 (5-7 PM)</p>
        <p className="text-gray-500 text-xl">Thwing Ballroom ($0)</p>
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-2">Feedback</h4>
        <div className="text-sm space-y-2">
          <p><span className="font-semibold">Pro:</span> Fun event, enjoyed the movie + timing</p>
          <p><span className="font-semibold">Con:</span> Food cold, so cold that I felt like i was in the ice age. Volume not big enough</p>
        </div>
      </div>
    </div>
  );
}
