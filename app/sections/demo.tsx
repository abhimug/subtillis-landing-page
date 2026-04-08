"use client";

import { useState } from "react";
import { DemoCustom } from "@/app/sections/demo-custom";
import { DemoWidget } from "@/app/sections/demo-widget";

const TABS = [
  { id: "custom", label: "Custom UI" },
  { id: "widget", label: "Widget" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Demo() {
  const [activeTab, setActiveTab] = useState<TabId>("custom");

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

        {/* Tab switcher */}
        <div className="mx-auto mt-10 flex w-fit gap-1 rounded-lg bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active demo */}
        <div className="mx-auto mt-10 flex justify-center">
          {activeTab === "custom" ? <DemoCustom /> : <DemoWidget />}
        </div>
      </div>
    </section>
  );
}
