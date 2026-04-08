"use client";

import { Button } from "@/app/components/ui/button";
import { DispatchPreview } from "@/app/animations/dispatch-preview";

const COPY = {
  headline: "AI agents for commercial service contractors",
  subhead:
    "The AI engine that handles scheduling, dispatch, and coordination so your techs stay billable and your office stops fighting fires.",
  cta: "Book a Meeting",
  ctaHref: "https://app.apollo.io/#/meet/aditya_modak_8e3/30-min",
};

export function Hero() {
  return (
    <section
      id="hero"
      className="mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl items-center px-6 py-24 md:py-32"
    >
      <div className="grid w-full grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {/* Left col: copy */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {COPY.headline}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            {COPY.subhead}
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="px-8 text-base">
              <a href={COPY.ctaHref} target="_blank" rel="noopener noreferrer">{COPY.cta}</a>
            </Button>
          </div>
        </div>

        {/* Right col: animation */}
        <div className="flex items-center justify-center">
          <DispatchPreview />
        </div>
      </div>
    </section>
  );
}
