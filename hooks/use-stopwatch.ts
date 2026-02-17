"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useStopwatch() {
  const [stopwatch, setStopwatch] = useState(0);
  const [prevStopwatch, setPrevStopwatch] = useState<number | null>(null);
  const stopwatchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const valueRef = useRef(0);

  useEffect(() => {
    stopwatchRef.current = setInterval(() => {
      setStopwatch((s) => {
        valueRef.current = s + 1;
        return s + 1;
      });
    }, 1000);
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setPrevStopwatch(valueRef.current);
    setStopwatch(0);
    valueRef.current = 0;
  }, []);

  return { stopwatch, prevStopwatch, reset };
}
