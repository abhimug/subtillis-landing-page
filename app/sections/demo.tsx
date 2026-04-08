"use client";

import { DemoCustom } from "@/app/sections/demo-custom";

export function Demo() {
  return (
    <section id="demo" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Talk to our AI agent
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Try booking a fake maintenance appointment live in your browser. No
            download, no phone number needed.
          </p>
        </div>

        <div className="mx-auto mt-16 flex justify-center">
          <DemoCustom />
        </div>
      </div>
    </section>
  );
}
