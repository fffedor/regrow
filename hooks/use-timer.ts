"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useTimer(totalSeconds: number, onFinish?: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsedMs = now - startTimeRef.current + elapsedBeforePauseRef.current * 1000;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, totalSeconds - elapsedSec);
    setRemainingSeconds(remaining);

    if (remaining <= 0) {
      setIsFinished(true);
      setIsRunning(false);
      onFinishRef.current?.();
    }
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 200);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, tick, clearTimer]);

  const start = useCallback(() => {
    if (isFinished) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [isFinished]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    const now = Date.now();
    elapsedBeforePauseRef.current += (now - startTimeRef.current) / 1000;
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    clearTimer();
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
    startTimeRef.current = 0;
    elapsedBeforePauseRef.current = 0;
  }, [totalSeconds, clearTimer]);

  return { remainingSeconds, isRunning, isFinished, start, pause, reset };
}
