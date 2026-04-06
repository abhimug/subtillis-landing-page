const COPY = {
  jobLabel:     "Job",
  matchedLabel: "Matched",
  rows: [
    { jobTitle: "HVAC Repair", jobAddress: "142 Oak St", techInitial: "M", techName: "M. Chen",   techMeta: "2.1 mi · HVAC" },
    { jobTitle: "Electrical",  jobAddress: "89 Pine Ave", techInitial: "R", techName: "R. Torres", techMeta: "0.8 mi · Elec" },
    { jobTitle: "Plumbing",    jobAddress: "55 Elm Blvd", techInitial: "J", techName: "J. Park",   techMeta: "3.4 mi · Plmb" },
  ],
} as const;

export function DispatchVisual() {
  return (
    <div className="mt-4 space-y-2">
      {COPY.rows.map((row) => (
        <div key={row.jobTitle} className="flex items-center gap-3">
          {/* Job */}
          <div className="w-28 rounded-md border border-border bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{COPY.jobLabel}</p>
            <p className="text-sm font-semibold text-foreground">{row.jobTitle}</p>
            <p className="text-xs text-muted-foreground">{row.jobAddress}</p>
          </div>

          {/* Connector */}
          <div className="flex flex-1 items-center gap-1">
            <div className="h-px flex-1 border-t-2 border-dashed border-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-px flex-1 border-t-2 border-dashed border-border" />
          </div>

          {/* Matched tech */}
          <div className="w-28 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <p className="text-xs text-muted-foreground">{COPY.matchedLabel}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {row.techInitial}
              </div>
              <p className="text-sm font-semibold text-foreground">{row.techName}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{row.techMeta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
