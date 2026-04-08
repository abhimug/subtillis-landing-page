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
    return () => {
      subscribersRef.current.delete(cb);
    };
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
