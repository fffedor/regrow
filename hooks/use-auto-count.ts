"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { haptic } from "@/lib/utils";

export function useAutoCount(interval: number, onIncrement: () => void) {
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(interval);
  const autoCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onIncrementRef = useRef(onIncrement);
  useEffect(() => {
    onIncrementRef.current = onIncrement;
  });

  const safeInterval = Math.max(1, interval);

  useEffect(() => {
    if (running) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      autoCountRef.current = setInterval(() => {
        onIncrementRef.current();
        setCountdown(safeInterval);
      }, safeInterval * 1000);
      return () => {
        if (autoCountRef.current) clearInterval(autoCountRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    } else {
      if (autoCountRef.current) clearInterval(autoCountRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [running, safeInterval]);

  const start = useCallback(() => {
    setCountdown(safeInterval);
    setRunning(true);
    haptic();
  }, [safeInterval]);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const resetCountdown = useCallback(() => {
    setCountdown(safeInterval);
  }, [safeInterval]);

  return { running, countdown, start, stop, resetCountdown };
}
