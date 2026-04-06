import { Separator } from "@/components/ui/separator";

const COPY = {
  sectionLabel: "Pre-Arrival Brief",
  location:     "Riverside Corporate Center",
  time:         "9:00 AM",
  details: [
    { label: "Unit",         value: "Carrier RTU-4 · Rooftop" },
    { label: "Last service", value: "Jan 14, 2025"            },
    { label: "Contact",      value: "Dana Mills · ext. 204"   },
  ],
  noteLabel: "Note",
  noteBody:  "Filter replacement overdue. Customer reported intermittent shutoffs since Dec.",
} as const;

export function FieldCommunicationVisual() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {COPY.sectionLabel}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {COPY.location}
          </p>
        </div>
        <div className="rounded-full bg-accent/20 px-2 py-0.5">
          <p className="text-xs font-medium text-accent-foreground">{COPY.time}</p>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Details */}
      <div className="space-y-2">
        {COPY.details.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-xs font-medium text-foreground">{row.value}</p>
          </div>
        ))}
      </div>

      <Separator className="my-3" />

      {/* Note */}
      <div className="rounded-md bg-accent/10 px-3 py-2">
        <p className="text-xs font-semibold text-accent-foreground">{COPY.noteLabel}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{COPY.noteBody}</p>
      </div>
    </div>
  );
}
