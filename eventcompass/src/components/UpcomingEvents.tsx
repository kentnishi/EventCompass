"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UpcomingApiRow = {
  id: string;
  title: string;
  location?: string | null;
  startDate: string;          // "YYYY-MM-DD"
  startTime?: string | null;  // "HH:MM:SS" or null
  committee?: string | null;
};

type Props = {
  /** Optional starting filter. */
  defaultCommittee?: string;
  /** Optional list of committee options for the popover. */
  committees?: string[];
  /** Max cards to fetch. */
  limit?: number;
};

const DEFAULT_COMMITTEES = [
  "Campus Engagement",
  "Thwing Tuesday",
  "Co-Programming",
  "Bootcamp",
  "Trips",
  "On Campus",
  "Off Campus",
  "Concerts",
  "ID",
  "Information",
  "Promo",
  "Finance"
];

export default function UpcomingEvents({
  defaultCommittee,
  committees = DEFAULT_COMMITTEES,
  limit = 12,
}: Props) {
  const router = useRouter();

  const [committee, setCommittee] = useState<string | undefined>(defaultCommittee);
  const [rows, setRows] = useState<UpcomingApiRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // popover
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // rail & progress
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // close popover on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!popRef.current || !btnRef.current) return;
      if (
        !popRef.current.contains(e.target as Node) &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // fetch data on committee/limit change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (committee) params.set("committee", committee);

    setRows(null);
    setError(null);

    fetch(`/api/events/upcoming?${params.toString()}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        return r.json();
      })
      .then((data: UpcomingApiRow[]) => setRows(data))
      .catch((e) => setError(e.message || "Failed to load upcoming events"));
  }, [committee, limit]);

  // progress bar calculation
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

  // helpers
  const combineToLocal = (d: string, t?: string | null) =>
    new Date(`${d}T${t ?? "00:00:00"}`);

  const items = useMemo(() => {
    if (!rows) return null;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      when: combineToLocal(r.startDate, r.startTime),
      where: r.location ?? "",
    }));
  }, [rows]);

  const isLoading = rows === null && !error;

  return (
    <section className="relative rounded-[10px] border border-[#eaecf1] bg-[white] p-4">
      {/* Header */}
      <div className="flex items-center gap-[10px] mb-[1px] mt-[5px] ml-[10px]">
        <span className="scale-98 text-xs font-[700] tracking-widest text-[#2d4da3]">
          UPCOMING EVENTS
        </span>

        {/* All pill */}
        <button
          className={[
            "text-xs px-2 py-0.5 rounded-full border text-[#4a5676]",
            !committee
              ? "bg-[#cfe0ff] border-[#b8c9f2] text-[#1f2b4a]"
              : "bg-[#eaf0fe] border-[#d6e1fb] text-[#536084] hover:bg-[#e1e9fd]",
          ].join(" ")}
          onClick={() => setCommittee(undefined)}
          aria-pressed={!committee}
        >
          ALL
        </button>

        {/* Committee pill → opens popover */}
        <div className="relative">
          <button
            ref={btnRef}
            className={[
              "text-xs px-2 py-0.5 rounded-full borde text-[#4a5676]",
              committee
                ? "bg-[#cfe0ff] border-[#b8c9f2] text-[#1f2b4a]"
                : "bg-[#eaf0fe] border-[#d6e1fb] text-[#536084] hover:bg-[#e1e9fd]",
            ].join(" ")}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            title={committee ? `Committee: ${committee}` : "Pick committee"}
          >
            COMMITTEE
          </button>

          {open && (
            <div
              ref={popRef}
              role="menu"
              className="absolute z-20 mt-2 w-56 rounded-xl border border-[#d6d9e7] bg-white shadow-lg p-2"
            >
              <div className="max-h-64 overflow-auto pr-1">
                {committees.map((c) => {
                  const active = committee === c;
                  return (
                    <button
                      key={c}
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        setCommittee(c);
                        setOpen(false);
                      }}
                      className={[
                        "w-full text-left px-3 py-2 border-[0.5px] border-[#f1f1ea] rounded-[5px] text-sm ",
                        active
                          ? "bg-[#e8f0ff] text-[#1f2b4a] font-medium"
                          : "bg-[#d4dcf1] text-[#2b3a55]",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCommittee(undefined);
                    setOpen(false);
                  }}
                  className="text-xs px-2 py-1 rounded-md border border-[#d6d9e7] text-[#2b3a55] bg-[#d4dcf1]"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs px-2 py-1 rounded-md bg-[#cfe0ff] text-[#1f2b4a] border border-[#b8c9f2]"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edge fades for the rail */}
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

      {/* Error */}
      {error && <div className="text-sm text-red-600 px-1 py-2">{error}</div>}

      {/* Cards rail */}
      <div ref={railRef} className="overflow-x-auto scroll-smooth py-2">
        <ul className="flex gap-4 p-2 items-stretch snap-x snap-mandatory ">
          {isLoading &&
            Array.from({ length: 2 }).map((_, i) => (
              <li
                key={`s-${i}`}
                className="snap-start shrink-0 w-100 h-32 rounded-2xl border border-[#d6d9e7] bg-[#e3e9f8] animate-pulse"
              />
            ))}

          {!isLoading &&
            items?.map((e) => (
              <li
                key={e.id}
                onClick={() => router.push(`/event-plans/${e.id}`)}
                className="cursor-pointer snap-start rounded-[10px] shrink-0 w-[350px] h-[150px] text-center rounded-2xl border border-[#f3f4f6] bg-[#e3e9f8] flex justify-center hover:shadow-md transition-shadow"
              >
                <div className="text-[18px] text-center justify-center m-auto p-4">
                  <div className="font-medium font-[700] text-[#2b3a55] truncate">
                    {e.title}
                  </div>
                  <div className="text-xs font-[700] text-[#5d6a8a]">
                    {e.when.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  {e.where && (
                    <div className="text-[15px] text-[#7a86a8] mt-0.5 truncate">
                      {e.where}
                    </div>
                  )}
                </div>
              </li>
            ))}

          {!isLoading && (!items || items.length === 0) && (
            <li className="shrink-0 w-full h-24 flex items-center justify-center text-sm text-[#637099]">
              No upcoming events.
            </li>
          )}
        </ul>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-2 rounded-full bg-[#eef2fa]">
        <div
          className="h-2 rounded-full bg-[#c9d6fb] transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* scoped scrollbar hide */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
