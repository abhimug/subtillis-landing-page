import { Card, CardContent } from "@/app/components/ui/card";
import { DispatchVisual } from "@/app/components/what-we-building-cards/dispatch-visual";
import { SchedulingVisual } from "@/app/components/what-we-building-cards/scheduling-visual";
import { FieldCommunicationVisual } from "@/app/components/what-we-building-cards/field-communication-visual";

const COPY = {
  headline: "The coordination layer for field service",
  body: "Teams every day make hundreds of small decisions: which tech gets which job, what info they need before they arrive, when to reschedule, who to call back.\n\nWe're building AI agents that handle this automatically:",
  capabilities: [
    { label: "Dispatch",            desc: "Match the right tech to the right job based on skills, location, and workload." },
    { label: "Scheduling",          desc: "Fill gaps, flag conflicts, optimize routes without manually playing schedule Tetris." },
    { label: "Field communication", desc: "Keep techs informed with job context, customer history, and equipment details." },
  ],
};

const VISUALS = [DispatchVisual, SchedulingVisual, FieldCommunicationVisual];

export function WhatWeBuilding() {
  return (
    <section id="what-we-do" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Centered header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {COPY.headline}
          </h2>
          {COPY.body.split("\n\n").map((para, i) => (
            <p key={i} className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {para}
            </p>
          ))}
        </div>

        {/* Capability cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {COPY.capabilities.map((item, i) => {
            const Visual = VISUALS[i];
            return (
              <Card key={item.label} className="flex flex-col gap-0 py-0">
                <CardContent className="flex flex-1 flex-col p-4">
                  <p className="text-lg font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  <Visual />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
