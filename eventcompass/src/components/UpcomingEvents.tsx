"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type UpcomingApiRow = {
  id: string;
  title: string;
  location?: string | null;
  startDate: string;     // "YYYY-MM-DD"
  startTime?: string | null; // "HH:MM:SS" or null
  committee?: string | null;
};

type Props = {
  /** optional committee filter; if omitted the toggle shows ALL/COMMITTEE */
  defaultCommittee?: string;
  /** how many cards to request */
  limit?: number;
};

export default function UpcomingEvents({ defaultCommittee, limit = 12 }: Props) {
  const [committee, setCommittee] = useState<string | undefined>(defaultCommittee);
  const [rows, setRows] = useState<UpcomingApiRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // fetch data
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (committee) params.set("committee", committee);

    setError(null);
    setRows(null);
    fetch(`/api/events/upcoming?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        return r.json();
      })
      .then((data: UpcomingApiRow[]) => setRows(data))
      .catch((e) => setError(e.message || "Failed to load upcoming events"));
  }, [committee, limit]);

  // local helpers
  function combineToLocal(startDate: string, startTime?: string | null) {
    // If you stored DATE + TIME (UTC-less), treat as local wall time.
    // Construct "YYYY-MM-DDTHH:MM:SS" without timezone and let the browser parse as local.
    const iso = `${startDate}T${startTime ?? "00:00:00"}`;
    return new Date(iso);
  }

  const items = useMemo(() => {
    if (!rows) return null;
    return rows.map((r) => {
      const dt = combineToLocal(r.startDate, r.startTime);
      return {
        id: r.id,
        title: r.title,
        when: dt,
        where: r.location ?? "",
      };
    });
  }, [rows]);

  // progress bar
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

  const isLoading = rows === null && !error;

  return (
    <section className="rounded-2xl border border-[#d6d9e7] bg-[white] rounded-[10px] p-4 relative">
      {/* Header */}
      <div className="scale-98 flex items-center gap-4 mb-3">
        <span className="text-xs font-semibold tracking-widest text-[#2b3a55]">
          UPCOMING EVENTS
        </span>

        {!defaultCommittee && (
          <div className="flex items-center gap-2 ml-2">
            <button
              className={`text-xs px-2 py-0.5 rounded-full border ${
                !committee
                  ? "bg-[#cfe0ff] border-[#b8c9f2] text-[#1f2b4a]"
                  : "bg-[#eaf0fe] border-[#d6e1fb] text-[#536084] hover:bg-[#e1e9fd]"
              }`}
              onClick={() => setCommittee(undefined)}
            >
              ALL
            </button>
            <button
              className={`text-xs px-2 py-0.5 rounded-full border ${
                committee
                  ? "bg-[#cfe0ff] border-[#b8c9f2] text-[#1f2b4a]"
                  : "bg-[#eaf0fe] border-[#d6e1fb] text-[#536084] hover:bg-[#e1e9fd]"
              }`}
              onClick={() => setCommittee("On-Campus")}
            >
              COMMITTEE
            </button>
          </div>
        )}
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-12 bottom-6 w-6 bg-gradient-to-r from-white to-transparent rounded-l-2xl" />
      <div className="pointer-events-none absolute right-0 top-12 bottom-6 w-6 bg-gradient-to-l from-white to-transparent rounded-r-2xl" />

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

      {/* Content */}
      {error && (
        <div className="text-sm text-red-600 px-1 py-2">{error}</div>
      )}

      <div ref={railRef} className="no-scrollbar overflow-x-auto scroll-smooth">
        <h1 className="scale-98 flex gap-4 pr-2 snap-x snap-mandatory">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <li
                key={`s-${i}`}
                className="snap-start shrink-0 w-72 h-32 rounded-2xl border border-[#d6d9e7] bg-[#e3e9f8] animate-pulse"
              />
            ))}

          {!isLoading &&
            items?.map((e) => (
              <li
                key={e.id}
                className="rounded-[10px] snap-start shrink-0 w-72 h-32 rounded-2xl border border-[#d6d9e7] bg-[#e3e9f8] flex items-center justify-center"
              >
                <div className="text-[17px] text-center">
                  <div className="font-medium text-[#2b3a55]">{e.title}</div>
                  <div className="text-xs text-[#5d6a8a]">
                    {e.when.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  {e.where && (
                    <div className="text-[12px] text-[#7a86a8] mt-0.5">
                      {e.where}
                    </div>
                  )}
                </div>
              </li>
            ))}

          {!isLoading && items && items.length === 0 && (
            <li className="shrink-0 w-full h-24 flex items-center justify-center text-sm text-[#637099]">
              No upcoming events.
            </li>
          )}
        </h1>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-2 rounded-full bg-[#eef2fa]">
        <div
          className="h-2 rounded-full bg-[#c9d6fb] transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      
    </section>
  );
}
