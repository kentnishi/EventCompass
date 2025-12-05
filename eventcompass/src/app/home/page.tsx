"use client";
import React from "react";
import Navbar from "@/components/NavBar";
import UpcomingEvents from "@/components/UpcomingEvents";
import CampusInsights from "@/components/Campus/CampusInsights";
import CampusPreferences from "@/components/Campus/CampusPreferences";
import LastEventAnalytics from "@/components/LastEventAnalytics";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      {/* 필요하면 <Navbar /> */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming rail */}
        <section className="mb-6 rounded-2xl shadow-sm">
          <UpcomingEvents />
        </section>

        {/* Campus Insights + Last Event Analytics */}
        <section className="mt-4 space-y-6">
          <CampusInsights />
          <LastEventAnalytics />
        </section>
      </div>
    </main>
  );
}