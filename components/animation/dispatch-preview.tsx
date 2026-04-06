"use client";

import { useEffect, useRef, useState } from "react";
import "./dispatch-preview.css";

const NOTIFICATIONS = [
  { tech: "Marcus T.", job: "HVAC — Downtown Office",          status: "Dispatched"  },
  { tech: "Sarah K.",  job: "Route — Riverside loop",          status: "Optimized"   },
  { tech: "James R.",  job: "Electrical — Harbor Blvd",        status: "Rescheduled" },
  { tech: "Priya M.",  job: "Inspect — Central Tower",         status: "Dispatched"  },
  { tech: "Marcus T.", job: "Conflict resolved — 2pm gap",     status: "Resolved"    },
  { tech: "Sarah K.",  job: "Plumbing — Riverside Apts",       status: "En Route"    },
  { tech: "James R.",  job: "Overtime alert cleared",          status: "Resolved"    },
  { tech: "Priya M.",  job: "New job — Harbor Blvd pm",        status: "Dispatched"  },
  { tech: "Marcus T.", job: "Route optimized — saved 14 min",  status: "Optimized"   },
  { tech: "Sarah K.",  job: "Emergency — Central Tower",       status: "Dispatched"  },
] as const;

type Status = (typeof NOTIFICATIONS)[number]["status"];

const STATUS_STYLES: Record<Status, string> = {
  Dispatched:  "bg-accent/40 text-accent-foreground",
  "En Route":  "bg-primary/10 text-primary",
  Rescheduled: "bg-muted text-muted-foreground",
  Optimized:   "bg-primary/10 text-primary",
  Resolved:    "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// Ticker geometry — must stay in sync with the card JSX below
const CARD_H = 64;   // px — fixed card height
const GAP    = 12;   // px — gap-3
const SLOT   = CARD_H + GAP; // 76px per slot
const VISIBLE = 4;
const WINDOW_H = VISIBLE * CARD_H + (VISIBLE - 1) * GAP; // 292px

const TRANSITION_MS = 450;
const INTERVAL_MS   = 2500;

export function DispatchPreview() {
  // Items ordered oldest (index 0, top) → newest (last, bottom)
  const [items, setItems] = useState<number[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => i)
  );
  const [isSliding, setIsSliding] = useState(false);
  const nextRef    = useRef(VISIBLE);
  const slidingRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (slidingRef.current) return;
      slidingRef.current = true;

      const nextIndex = nextRef.current % NOTIFICATIONS.length;
      nextRef.current += 1;

      // Append the new card at the bottom and start scrolling up
      setItems((prev) => [...prev, nextIndex]);
      setIsSliding(true);

      // After the transition: remove the top card and snap translateY back to 0
      // React 19 batches both updates into one render → no visual flash
      setTimeout(() => {
        setIsSliding(false);
        setItems((prev) => prev.slice(1));
        slidingRef.current = false;
      }, TRANSITION_MS);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative h-[420px] w-full max-w-sm rounded-2xl border border-border bg-card shadow-md overflow-hidden"
      data-animation-target=""
    >
      <div className="absolute inset-0 flex flex-col p-6 gap-3">

        {/* Ticker window — clips the entering and exiting cards */}
        <div style={{ height: WINDOW_H, overflow: "hidden" }}>
          {/* Inner wrapper — translates as a single unit */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              transform: isSliding ? `translateY(-${SLOT}px)` : "translateY(0)",
              transition: isSliding
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`
                : "none",
            }}
          >
            {items.map((poolIndex) => {
              const row = NOTIFICATIONS[poolIndex % NOTIFICATIONS.length];
              return (
                <div
                  key={poolIndex}
                  className="flex shrink-0 items-center justify-between rounded-lg border border-border bg-background px-4 shadow-xs"
                  style={{ height: CARD_H }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {row.tech.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{row.tech}</p>
                      <p className="text-[13px] text-muted-foreground leading-tight truncate">{row.job}</p>
                    </div>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent thinking indicator */}
        <div className="mt-auto flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1">
            {[0, 0.12, 0.24].map((d, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-accent"
                style={{ animation: "wave 1s ease-in-out infinite", animationDelay: `${d}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Agent optimizing schedule…
          </span>
        </div>
      </div>
    </div>
  );
}
