"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { ConversationProvider } from "@elevenlabs/react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { useVoiceCall } from "@/lib/hooks/use-voice-call";
import { useAudioVisualizer } from "@/lib/hooks/use-audio-visualizer";
import type { TranscriptMessage } from "@/shared/types";

// ── Copy ──────────────────────────────────────────────
const COPY = {
  agentName: "Alex",
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
    if (!active) {
      setSeconds(0);
      return;
    }
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
    () => barsRef.current
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
            {msg.source === "agent" ? "Alex" : "You"}:
          </span>{" "}
          {msg.text}
        </div>
      ))}
    </div>
  );
}

// ── Inner Component (needs ConversationProvider) ──────
function DemoCustomInner() {
  const {
    status,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    reset,
    getOutputByteFrequencyData,
    isMuted,
    setMuted,
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
                onClick={() => setMuted(!isMuted)}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff /> : <Mic />}
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
              <p className="text-sm text-muted-foreground">
                {COPY.mockMessage}
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={reset}
            >
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

// ── Exported Component (provides ConversationProvider) ─
export function DemoCustom() {
  return (
    <ConversationProvider>
      <DemoCustomInner />
    </ConversationProvider>
  );
}
