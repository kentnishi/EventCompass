"use client";
import React from "react";
import BaseChart, { doughnutCenterText } from "./charts/BaseChart";
import { ChartConfiguration, ChartOptions } from "chart.js";

export default function CampusPreferences() {
  // 1) Popular Days (bar)
  const daysCfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels: ["Mon","Tues","Wed","Thu","Fri","Sat","Sun"],
      datasets: [{
        label: "Event Volume",
        data: [150,300,400,550,350,100,80],
        backgroundColor: (ctx: { dataIndex: number; }) => ctx.dataIndex === 3 ? "#FF7A5A" : "#A3BFFA",
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 600, ticks: { stepSize: 150 }, grid: {} },
        x: { grid: { display: false } }
      },
      plugins: { tooltip: { enabled: false } }
    }
  };

  // 2) Popular Times (line)
  const timesCfg: ChartConfiguration = {
    type: "line",
    data: {
      labels: ["8am", "", "2pm", "", "8pm", "", "2am"],
      datasets: [{
        label: "Popularity",
        data: [50, 80, 250, 320, 450, 150, 40],
        borderColor: "#82a5f5",
        backgroundColor: "rgba(130,165,245,0.1)",
        fill: true, tension: 0.4, pointRadius: 0
      }]
    },
    options: { scales: { y: { display: false }, x: { grid: { display: false } } }, plugins: { tooltip: { enabled: false } } }
  };

//   // 3) Dietary donut
//     const dietOptions: ChartOptions<"doughnut"> = {
//         cutout: "70%",
//         plugins: {
//             doughnutCenterText: { text: "7%\nVegetarian"}, // use \n (single backslash)
//         },
//         };

//     // 2) type the whole config as a doughnut chart
//     const dietCfg: ChartConfiguration<"doughnut"> = {
//         type: "doughnut",
//         data: {
//             labels: ["Vegetarian", "Vegan", "Other"],
//             datasets: [
//             {
//                 data: [70, 20, 10],
//                 backgroundColor: ["#60A5FA", "#3B82F6", "#BFDBFE"],
//                 borderWidth: 0,
//             },
//             ],
//         },
//     options: dietOptions,
//     plugins: [doughnutCenterText],
//     };

    return (
        <div className="lg:col-span-2 bg-gray-100/60 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Campus Preferences</h2>

        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Popular Days</h3>
            <p className="text-xs text-gray-400 mb-2">Event Volume</p>
            <BaseChart config={daysCfg} height={192} />
            </div>

            <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Popular Times</h3>
            <BaseChart config={timesCfg} height={192} />
            <p className="text-center text-xs text-blue-500 font-medium mt-2">Time Recommendations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Popular Vendors</h3>
                <ul className="space-y-3 text-sm">
                {[
                    ["SITOOS", 4.2],
                    ["MOCHINUT", 4.2],
                    ["UR MOTHER", 4.2],
                    ["GIGSALAD ERM VEN...", 4.2],
                ].map(([name, score]) => (
                    <li key={name as string} className="flex justify-between items-center">
                    <span>{name as string}</span>
                    <span className="flex items-center text-yellow-500 font-semibold">
                        {score} <span className="ml-1 text-base">★</span>
                    </span>
                    </li>
                ))}
                </ul>
            </div>

            </div>

            <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Popular Themes</h3>
            <div className="flex flex-wrap gap-2">
                {["FREE","MERCH","VIDEO GAMES","GAMBLING"].map((t) => (
                <span key={t} className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {t}
                </span>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
    }
