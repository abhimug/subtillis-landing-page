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
