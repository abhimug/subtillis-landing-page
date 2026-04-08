"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import type { CallStatus, SignedUrlResponse, TranscriptMessage } from "@/shared/types";
import { API_ROUTES } from "@/shared/api-routes";

export function useVoiceCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  const conversation = useConversation({
    onConnect: () => setCallStatus("connected"),
    onDisconnect: () => setCallStatus("ended"),
    onError: () => setCallStatus("error"),
    onMessage: (message) => {
      const source = message.source === "ai" ? "agent" : "user";
      setTranscript((prev) => [
        ...prev,
        { source, text: message.message } as TranscriptMessage,
      ]);
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

      conversation.startSession({ signedUrl: signedUrl! });
    } catch {
      setCallStatus("error");
    }
  }, [conversation]);

  const endCall = useCallback(async () => {
    conversation.endSession();
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
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    getInputByteFrequencyData: conversation.getInputByteFrequencyData,
    getOutputByteFrequencyData: conversation.getOutputByteFrequencyData,
  };
}
