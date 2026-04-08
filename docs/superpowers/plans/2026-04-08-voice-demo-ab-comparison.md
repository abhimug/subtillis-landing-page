# Voice Demo A/B Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two side-by-side ElevenLabs voice demo variants — a polished custom UI (Approach A) and the embeddable widget (Approach C) — so the user can compare and choose.

**Architecture:** The demo section gets a tab switcher (Custom / Widget). Each tab renders an independent component. Approach A replaces `@elevenlabs/client` with `@elevenlabs/react`'s `useConversation` hook and builds a rich UI with live transcript, audio visualization, speaking/listening indicator, and mic mute. Approach C wraps the `<elevenlabs-convai>` web component. The existing backend signed-url flow is preserved for Approach A.

**Tech Stack:** Next.js 16, React 19, `@elevenlabs/react`, `@elevenlabs/convai-widget-embed`, Tailwind CSS 4, shadcn/ui

---

## File Structure

```
app/sections/demo.tsx                    — REWRITE: tab switcher + section heading
app/sections/demo-loader.tsx             — MODIFY: dynamic import both variants
app/sections/demo-custom.tsx             — CREATE: Approach A custom voice UI
app/sections/demo-widget.tsx             — CREATE: Approach C widget wrapper
lib/hooks/use-voice-call.ts              — REWRITE: use @elevenlabs/react's useConversation
lib/hooks/use-audio-visualizer.ts        — CREATE: requestAnimationFrame loop for frequency data
shared/types.ts                          — MODIFY: add transcript message type
```

---

### Task 1: Install `@elevenlabs/react` and remove `@elevenlabs/client`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Swap the dependency**

```bash
cd /Users/amugunda/Repos/Website-main
npm uninstall @elevenlabs/client && npm install @elevenlabs/react
```

- [ ] **Step 2: Verify installation**

```bash
ls node_modules/@elevenlabs/react/dist/index.d.ts
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap @elevenlabs/client for @elevenlabs/react"
```

---

### Task 2: Update shared types

**Files:**
- Modify: `shared/types.ts`

- [ ] **Step 1: Add transcript message type and update CallStatus**

Replace the full contents of `shared/types.ts` with:

```typescript
// UI state machine for the voice call
export type CallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "ended"
  | "error"
  | "mock";

// What the backend API returns to the frontend.
// signedUrl is null when the backend isn't connected yet (mockMode: true).
export interface SignedUrlResponse {
  signedUrl: string | null;
  mockMode: boolean;
}

// A single message in the live transcript
export interface TranscriptMessage {
  source: "user" | "agent";
  text: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/types.ts
git commit -m "feat: add TranscriptMessage type"
```

---

### Task 3: Rewrite `useVoiceCall` hook with `@elevenlabs/react`

**Files:**
- Rewrite: `lib/hooks/use-voice-call.ts`

- [ ] **Step 1: Rewrite the hook**

Replace the full contents of `lib/hooks/use-voice-call.ts` with:

```typescript
"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import type { CallStatus, SignedUrlResponse, TranscriptMessage } from "@/shared/types";
import { API_ROUTES } from "@/shared/api-routes";

export function useVoiceCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [micMuted, setMicMuted] = useState(false);

  const conversation = useConversation({
    micMuted,
    onConnect: () => setCallStatus("connected"),
    onDisconnect: () => setCallStatus("ended"),
    onError: () => setCallStatus("error"),
    onMessage: (message) => {
      // message has .message (string) and .source ("user" | "ai")
      const source = message.source === "ai" ? "agent" : "user";
      setTranscript((prev) => [...prev, { source, text: message.message }]);
    },
  });

  const startCall = useCallback(async () => {
    setCallStatus("connecting");
    setTranscript([]);
    try {
      // Request microphone permission before anything else
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const res = await fetch(API_ROUTES.elevenlabs.signedUrl);
      const { signedUrl, mockMode }: SignedUrlResponse = await res.json();

      if (mockMode) {
        setCallStatus("mock");
        return;
      }

      await conversation.startSession({ signedUrl: signedUrl! });
    } catch {
      setCallStatus("error");
    }
  }, [conversation]);

  const endCall = useCallback(async () => {
    await conversation.endSession();
    setCallStatus("ended");
  }, [conversation]);

  const reset = useCallback(() => {
    setCallStatus("idle");
    setTranscript([]);
  }, []);

  return {
    status: callStatus,
    isSpeaking: conversation.isSpeaking,
    transcript,
    startCall,
    endCall,
    reset,
    micMuted,
    setMicMuted,
    // Expose for audio visualizer
    getInputByteFrequencyData: conversation.getInputByteFrequencyData,
    getOutputByteFrequencyData: conversation.getOutputByteFrequencyData,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/hooks/use-voice-call.ts
git commit -m "feat: rewrite useVoiceCall with @elevenlabs/react"
```

---

### Task 4: Create audio visualizer hook

**Files:**
- Create: `lib/hooks/use-audio-visualizer.ts`

- [ ] **Step 1: Write the hook**

Create `lib/hooks/use-audio-visualizer.ts`:

```typescript
"use client";

import { useRef, useEffect, useCallback } from "react";

interface UseAudioVisualizerOptions {
  getByteFrequencyData: (() => Uint8Array) | undefined;
  barCount?: number;
  active: boolean;
}

/**
 * Drives a canvas-free bar visualizer by returning normalized bar heights
 * on every animation frame. The caller renders bars via CSS transforms.
 */
export function useAudioVisualizer({
  getByteFrequencyData,
  barCount = 5,
  active,
}: UseAudioVisualizerOptions) {
  const barsRef = useRef<number[]>(Array(barCount).fill(0));
  const rafRef = useRef<number>(0);
  const subscribersRef = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback((cb: () => void) => {
    subscribersRef.current.add(cb);
    return () => { subscribersRef.current.delete(cb); };
  }, []);

  useEffect(() => {
    if (!active || !getByteFrequencyData) {
      barsRef.current = Array(barCount).fill(0);
      subscribersRef.current.forEach((cb) => cb());
      return;
    }

    const tick = () => {
      const data = getByteFrequencyData();
      if (data && data.length > 0) {
        const step = Math.floor(data.length / barCount);
        for (let i = 0; i < barCount; i++) {
          // Average a slice of the frequency spectrum, normalize to 0-1
          let sum = 0;
          for (let j = i * step; j < (i + 1) * step && j < data.length; j++) {
            sum += data[j];
          }
          barsRef.current[i] = sum / step / 255;
        }
      }
      subscribersRef.current.forEach((cb) => cb());
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, getByteFrequencyData, barCount]);

  return { barsRef, subscribe };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/hooks/use-audio-visualizer.ts
git commit -m "feat: add useAudioVisualizer hook"
```

---

### Task 5: Build Approach A — custom voice demo component

**Files:**
- Create: `app/sections/demo-custom.tsx`

This is the polished custom UI with: call states, live transcript, audio visualization bars, speaking/listening indicator, mic mute toggle, and call timer.

- [ ] **Step 1: Create the component**

Create `app/sections/demo-custom.tsx`:

```tsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { useVoiceCall } from "@/lib/hooks/use-voice-call";
import { useAudioVisualizer } from "@/lib/hooks/use-audio-visualizer";
import type { TranscriptMessage } from "@/shared/types";

// ── Copy ──────────────────────────────────────────────
const COPY = {
  agentName: "Aria",
  agentRole: "AI scheduling agent",
  callCta: "Start call",
  endCta: "End call",
  connecting: "Connecting...",
  mockMessage: "Agent backend coming soon — stay tuned.",
  error: "Something went wrong. Please try again.",
};

// ── Timer ─────────────────────────────────────────────
function useCallTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Audio Bars ────────────────────────────────────────
function AudioBars({
  getByteFrequencyData,
  active,
}: {
  getByteFrequencyData: (() => Uint8Array) | undefined;
  active: boolean;
}) {
  const barCount = 5;
  const { barsRef, subscribe } = useAudioVisualizer({
    getByteFrequencyData,
    barCount,
    active,
  });

  const bars = useSyncExternalStore(
    subscribe,
    () => barsRef.current,
    () => barsRef.current,
  );

  return (
    <div className="flex items-end gap-1 h-8" aria-hidden>
      {bars.map((level, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-primary transition-[height] duration-75"
          style={{ height: `${Math.max(4, level * 32)}px` }}
        />
      ))}
    </div>
  );
}

// ── Transcript ────────────────────────────────────────
function Transcript({ messages }: { messages: TranscriptMessage[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="mt-4 max-h-40 overflow-y-auto space-y-2 text-sm w-full">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={
            msg.source === "agent"
              ? "text-muted-foreground"
              : "text-foreground font-medium"
          }
        >
          <span className="font-semibold">
            {msg.source === "agent" ? "Aria" : "You"}:
          </span>{" "}
          {msg.text}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────
export function DemoCustom() {
  const {
    status,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    reset,
    getOutputByteFrequencyData,
    micMuted,
    setMicMuted,
  } = useVoiceCall();

  const timer = useCallTimer(status === "connected");

  // Auto-reset after call ends
  useEffect(() => {
    if (status !== "ended") return;
    const id = setTimeout(reset, 3000);
    return () => clearTimeout(id);
  }, [status, reset]);

  return (
    <Card className="w-full max-w-[22rem]">
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-5 py-6">

        {/* ── Idle ── */}
        {status === "idle" && (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Phone className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{COPY.agentName}</p>
              <p className="text-sm text-muted-foreground">{COPY.agentRole}</p>
            </div>
            <Button size="lg" className="w-full" onClick={startCall}>
              <Phone /> {COPY.callCta}
            </Button>
          </>
        )}

        {/* ── Connecting ── */}
        {status === "connecting" && (
          <>
            <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-primary/10">
              <Phone className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{COPY.agentName}</p>
              <p className="text-sm text-muted-foreground">{COPY.agentRole}</p>
            </div>
            <Button size="lg" className="w-full" disabled>
              {COPY.connecting}
            </Button>
          </>
        )}

        {/* ── Connected ── */}
        {status === "connected" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <Badge className="gap-1.5">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                {isSpeaking ? "Speaking" : "Listening"}
              </Badge>
              <AudioBars
                getByteFrequencyData={getOutputByteFrequencyData}
                active={status === "connected"}
              />
              <span className="font-mono text-2xl tabular-nums text-foreground">
                {timer}
              </span>
            </div>

            <Transcript messages={transcript} />

            <div className="flex w-full gap-2">
              <Button
                size="lg"
                variant="outline"
                className="shrink-0"
                onClick={() => setMicMuted(!micMuted)}
                aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {micMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                onClick={endCall}
              >
                <PhoneOff /> {COPY.endCta}
              </Button>
            </div>
          </>
        )}

        {/* ── Ended ── */}
        {status === "ended" && (
          <>
            <p className="text-sm text-muted-foreground">Call ended.</p>
            {transcript.length > 0 && <Transcript messages={transcript} />}
          </>
        )}

        {/* ── Mock ── */}
        {status === "mock" && (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Phone className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{COPY.agentName}</p>
              <p className="text-sm text-muted-foreground">{COPY.mockMessage}</p>
            </div>
            <Button size="lg" variant="outline" className="w-full" onClick={reset}>
              Got it
            </Button>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <Phone className="size-7 text-destructive" />
            </div>
            <p className="text-sm text-destructive">{COPY.error}</p>
            <Button size="lg" className="w-full" onClick={reset}>
              Try again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sections/demo-custom.tsx
git commit -m "feat: add polished custom voice demo (Approach A)"
```

---

### Task 6: Build Approach C — ElevenLabs widget wrapper

**Files:**
- Create: `app/sections/demo-widget.tsx`

This wraps the `<elevenlabs-convai>` web component. The agent ID comes from an API call to avoid exposing it in client JS (it's already in our backend env).

- [ ] **Step 1: Create the component**

Create `app/sections/demo-widget.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { API_ROUTES } from "@/shared/api-routes";

/**
 * Approach C: ElevenLabs embeddable widget.
 * Loads the convai-widget-embed script and renders the <elevenlabs-convai>
 * custom element. Agent ID is fetched from the server to keep it out of
 * the client bundle.
 */
export function DemoWidget() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Fetch agent ID from server
  useEffect(() => {
    fetch(API_ROUTES.elevenlabs.agentId)
      .then((res) => res.json())
      .then((data) => {
        if (data.agentId) setAgentId(data.agentId);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  // Load the widget script once we have an agent ID
  useEffect(() => {
    if (!agentId) return;

    const scriptId = "elevenlabs-convai-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [agentId]);

  if (error) {
    return (
      <Card className="w-full max-w-[22rem]">
        <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">
            Widget unavailable — agent not configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!agentId) {
    return (
      <Card className="w-full max-w-[22rem]">
        <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-6">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading widget...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[22rem]">
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-6">
        <div className="w-full">
          {/* @ts-expect-error — custom element not in JSX types */}
          <elevenlabs-convai agent-id={agentId} />
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sections/demo-widget.tsx
git commit -m "feat: add ElevenLabs widget wrapper (Approach C)"
```

---

### Task 7: Add `/api/elevenlabs/agent-id` route for the widget

**Files:**
- Create: `app/api/elevenlabs/agent-id/route.ts`

The widget needs the agent ID on the client. This thin route returns it without exposing the API key.

- [ ] **Step 1: Create the route**

Create `app/api/elevenlabs/agent-id/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ agentId: null }, { status: 503 });
  }
  return NextResponse.json({ agentId });
}
```

- [ ] **Step 2: Add the route to the shared routes map**

In `shared/api-routes.ts`, add the new route:

```typescript
export const API_ROUTES = {
  elevenlabs: {
    signedUrl: "/api/elevenlabs/signed-url",
    agentId: "/api/elevenlabs/agent-id",
  },
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add app/api/elevenlabs/agent-id/route.ts shared/api-routes.ts
git commit -m "feat: add agent-id endpoint for widget"
```

---

### Task 8: Rewrite demo section with tab switcher

**Files:**
- Rewrite: `app/sections/demo.tsx`
- Modify: `app/sections/demo-loader.tsx`

- [ ] **Step 1: Rewrite `demo.tsx` with tabs**

Replace the full contents of `app/sections/demo.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify `demo-loader.tsx` still works**

The existing dynamic import should still work since `Demo` is still the named export from `demo.tsx`. No changes needed to `demo-loader.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("@/app/sections/demo").then((m) => m.Demo), { ssr: false });

export { Demo };
```

- [ ] **Step 3: Commit**

```bash
git add app/sections/demo.tsx
git commit -m "feat: add tab switcher between custom UI and widget demos"
```

---

### Task 9: Smoke test the dev server

- [ ] **Step 1: Start the dev server and check for build errors**

```bash
cd /Users/amugunda/Repos/Website-main && npm run dev
```

Expected: compiles without errors. The page loads at `http://localhost:3000` with the demo section showing two tabs.

- [ ] **Step 2: Verify tab switching works**

Click "Custom UI" and "Widget" tabs. Each should render its respective component.

- [ ] **Step 3: Verify mock mode**

Without env vars set, clicking "Start call" on the Custom UI tab should show the mock message. The widget tab should show "Widget unavailable — agent not configured."

- [ ] **Step 4: If any errors, fix and commit**

```bash
git add -A
git commit -m "fix: resolve dev build issues"
```

