const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const TECHS = [
  {
    name: "M. Chen",
    initial: "M",
    slots: [
      { start: 0, span: 2, label: "HVAC Repair" },
      { start: 3, span: 2, label: "PM Inspection" },
    ],
  },
  {
    name: "R. Torres",
    initial: "R",
    slots: [
      { start: 1, span: 1, label: "Electrical" },
      { start: 2, span: 2, label: "Panel Upgrade" },
      { start: 4, span: 1, label: "Walkthrough" },
    ],
  },
  { 
    name: "J. Park",
    initial: "J",
    slots: [
      { start: 0, span: 1, label: "Leak Repair" },
      { start: 2, span: 1, label: "Inspection" },
      { start: 3, span: 2, label: "Install" },
    ],
  },
];

export function SchedulingVisual() {
  return (
    <div className="mt-4">
      {/* Day headers */}
      <div className="mb-2 grid grid-cols-5 gap-1 pl-8 pr-2">
        {DAYS.map((day) => (
          <p key={day} className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {day}
          </p>
        ))}
      </div>

      {/* Tech rows */}
      <div className="space-y-2">
        {TECHS.map((tech) => (
          <div key={tech.name} className="flex items-center gap-2">
            {/* Tech avatar */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {tech.initial}
            </div>

            {/* Grid */}
            <div className="relative grid flex-1 grid-cols-5 gap-1 pr-2">
              {/* Empty background cells */}
              {DAYS.map((day) => (
                <div key={day} className="h-8 rounded bg-muted" />
              ))}

              {/* Job blocks overlaid */}
              {tech.slots.map((slot, i) => {
                const hitsRightEdge = slot.start + slot.span >= 5;
                return (
                  <div
                    key={i}
                    className="absolute top-0 flex h-8 items-center overflow-hidden rounded bg-primary px-1.5"
                    style={{
                      left: `calc(${slot.start} * (100% / 5) + ${slot.start * 4}px)`,
                      width: `calc(${slot.span} * (100% / 5) + ${(slot.span - 1) * 4}px${hitsRightEdge ? " - 10px" : ""})`,
                    }}
                  >
                    <p className="truncate text-[10px] font-medium text-primary-foreground">
                      {slot.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
