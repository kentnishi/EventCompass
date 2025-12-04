"use client";
import React from "react";
import Navbar from "../../components/NavBar";
import UpcomingEvents from "../../components/UpcomingEvents";
import CampusPreferences from "../../components/CampusPreferences";
import LastEventAnalytics from "../../components/LastEventAnalytics";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9]">

      {/* center the content like the mock */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-6 bg-pink rounded-2xl shadow-sm p-4">
          <UpcomingEvents />
        </section>

        {/* == two columns == */}
        <section className="max-w-6xl mx-auto px-6">
        {/* header + upcoming rail above ... */}

        {/* TWO COLUMNS from md up (2/3 split like your mock) */}
        <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-2 gap-6 items-start">
          <div className="col-span-1">
            <CampusPreferences />
          </div>
          <div className="col-span-1">
            <LastEventAnalytics />
          </div>
        </div>
        </div>
        </section>
      </div>
    </main>
  );
}
