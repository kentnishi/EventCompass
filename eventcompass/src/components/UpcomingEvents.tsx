"use client";

import React, { useEffect, useRef, useState } from "react";
import type { EventSummary } from "../types";

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/api/events/upcoming").then(async (r) => setEvents(await r.json()));
  }, []);

  // progress bar like your SavedMeals scrollbar feedback
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const p = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = 288; // ≈ w-72
    el.scrollBy({ left: dir * (card + 16) * 2, behavior: "smooth" });
  };

  const items =
    events.length > 0
      ? events
      : Array.from({ length: 8 }).map((_, i) => ({
          id: i + 1,
          title: `Event ${i + 1}`,
          startTime: new Date().toISOString(),
        })) as EventSummary[];

  return (
    <div className="rounded-2xl border border-[#d6d9e7] bg-white p-4 relative">
      {/* Header */}
      <div className="flex items-center gap-5 mb-3">
        <span className="text-xs font-semibold tracking-widest text-[#2b3a55] mr-4">
          UPCOMING EVENTS
        </span>
        <span className="text-xs bg-[#dfe7f7] px-2 py-0.5 rounded-full text-[#2b3a55] border border-[#cdd7ee] mr-4 gap-3">ALL</span>
        <span className="text-xs bg-[#dfe7f7] px-2 py-0.5 rounded-full text-[#2b3a55] border border-[#cdd7ee] mr-4">
          COMMITTEE
        </span>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-12 bottom-6 w-6 bg-gradient-to-r from-white to-transparent rounded-l-2xl" />
      <div className="pointer-events-none absolute right-0 top-12 bottom-6 w-6 bg-gradient-to-l from-white to-transparent rounded-full" />

      {/* Arrows */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollByCards(-1)}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-[#d6d9e7] shadow hover:bg-white"
      >
        ‹
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scrollByCards(1)}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-[#d6d9e7] shadow hover:bg-white"
      >
        ›
      </button>

      {/* Scroll rail */}
      <div ref={railRef} className="no-scrollbar overflow-x-auto scroll-smooth">
        <ul className="flex gap-4 pr-2 snap-x snap-mandatory">
          {items.map((e) => (
            <li
              key={e.id}
              className="snap-start shrink-0 w-72 h-32 rounded-2xl border border-[#d6d9e7] bg-[#e3e9f8] flex items-center justify-center"
            >
              <div className="opacity-70 text-center">
                <div className="font-medium">{e.title}</div>
                <div className="text-xs">
                  {new Date(e.startTime).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-2 rounded-full bg-[#eef2fa]">
        <div
          className="h-2 rounded-full bg-[#c9d6fb] transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* hide scrollbar (component-scoped) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
