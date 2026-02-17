"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Goal } from "@/lib/types";
import { formatTime, haptic } from "@/lib/utils";
import { useTimer } from "@/hooks/use-timer";
import { useSessions } from "@/hooks/use-sessions";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { useAutoCount } from "@/hooks/use-auto-count";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SessionComplete } from "./session-complete";

const ROUND_BTN =
  "w-20 h-20 rounded-full text-white text-2xl font-bold flex items-center justify-center cursor-pointer shadow-lg";

const springTap = {
  type: "spring" as const,
  stiffness: 500,
  damping: 25,
};

interface SessionViewProps {
  goal: Goal;
  onClose: () => void;
  onCompleted: (goalId: string) => void;
}

export function SessionView({ goal, onClose, onCompleted }: SessionViewProps) {
  const [currentReps, setCurrentReps] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [finalReps, setFinalReps] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);
  const [latestGoal, setLatestGoal] = useState(goal);
  const completedRef = useRef(false);
  const sessionStartRef = useRef(0);
  const [timerStarted, setTimerStarted] = useState(false);

  const hasTime = goal.type === "time";
  const hasReps = goal.type === "reps";
  const autoCountInterval = goal.autoCountInterval ?? 0;
  const hasAutoCount = hasReps && autoCountInterval > 0;

  const currentRepsRef = useRef(0);
  const finishRef = useRef<(reps: number) => void>(() => {});

  const timer = useTimer(hasTime ? (goal.targetSeconds ?? 0) : 0, () => {
    if (hasTime && !completedRef.current) {
      finishRef.current(currentRepsRef.current);
    }
  });
  const { startSession, completeSession, abandonSession } = useSessions();
  const stopwatch = useStopwatch();

  const startSessionRef = useRef(startSession);
  useEffect(() => {
    startSessionRef.current = startSession;
  });

  useEffect(() => {
    sessionStartRef.current = Date.now();
    const session = startSessionRef.current(goal.id);
    setSessionId(session.id);
  }, [goal.id]);

  const finishSession = useCallback(
    (reps: number) => {
      if (completedRef.current || !sessionId) return;
      completedRef.current = true;
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      completeSession(sessionId, reps, elapsed);
      onCompleted(goal.id);
      const updatedCount = goal.completedCount + 1;
      setLatestGoal({ ...goal, completedCount: updatedCount });
      setFinalReps(reps);
      setFinalElapsed(elapsed);
      setCompleted(true);
    },
    [sessionId, completeSession, onCompleted, goal],
  );

  useEffect(() => {
    finishRef.current = finishSession;
  });
  useEffect(() => {
    currentRepsRef.current = currentReps;
  });

  const handleAutoIncrement = useCallback(() => {
    if (completedRef.current) return;
    setCurrentReps((prev) => {
      const newReps = prev + 1;
      haptic();
      if (hasReps && goal.targetReps && newReps >= goal.targetReps) {
        setTimeout(() => finishSession(newReps), 0);
      }
      return newReps;
    });
    stopwatch.reset();
  }, [hasReps, goal.targetReps, finishSession, stopwatch]);

  const autoCount = useAutoCount(
    Math.max(1, autoCountInterval),
    handleAutoIncrement,
  );

  useEffect(() => {
    if (completed) autoCount.stop();
  }, [completed, autoCount]);

  const handleIncrement = () => {
    if (completedRef.current) return;
    const newReps = currentReps + 1;
    setCurrentReps(newReps);
    stopwatch.reset();
    haptic();

    if (hasReps && goal.targetReps && newReps >= goal.targetReps) {
      finishSession(newReps);
    }
  };

  const handleStartTimer = () => {
    if (timerStarted || completedRef.current) return;
    timer.start();
    setTimerStarted(true);
    haptic();
  };

  const handleCompleteEarly = () => {
    if (!sessionId || completedRef.current) return;
    finishSession(currentReps);
  };

  const handleAbandon = () => {
    if (!sessionId || completedRef.current) return;
    autoCount.stop();
    const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    abandonSession(sessionId, currentReps, elapsed);
    onClose();
  };

  const handleRepeat = () => {
    setCurrentReps(0);
    setCompleted(false);
    completedRef.current = false;
    sessionStartRef.current = Date.now();
    timer.reset();
    setTimerStarted(false);
    autoCount.stop();
    const session = startSession(goal.id);
    setSessionId(session.id);
  };

  if (completed) {
    return (
      <SessionComplete
        goal={latestGoal}
        reps={finalReps}
        elapsedSeconds={finalElapsed}
        onGoHome={onClose}
        onRepeat={handleRepeat}
      />
    );
  }

  const repsProgress =
    hasReps && goal.targetReps ? Math.min(100, (currentReps / goal.targetReps) * 100) : 0;
  const timeProgress =
    hasTime && goal.targetSeconds
      ? Math.min(100, ((goal.targetSeconds - timer.remainingSeconds) / goal.targetSeconds) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <motion.div
        className="text-center pt-8 pb-4 px-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="text-4xl mb-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
        >
          {goal.icon}
        </motion.div>
        <motion.h2
          className="text-xl font-bold"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        >
          {goal.name}
        </motion.h2>
        <motion.p
          className="text-sm text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Completed: {goal.completedCount} times
        </motion.p>
      </motion.div>

      {/* Counter & Timer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        {hasReps && (
          <>
            <div className="text-6xl font-bold tabular-nums">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentReps}
                  initial={{ opacity: 0, scale: 1.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="inline-block"
                >
                  {currentReps}
                </motion.span>
              </AnimatePresence>
              {goal.targetReps ? (
                <span className="text-3xl text-muted-foreground">
                  {" "}
                  / {goal.targetReps}
                </span>
              ) : null}
            </div>

            {goal.showStopwatch !== false && !hasAutoCount && (
              <div className="relative flex items-end justify-center font-mono tabular-nums">
                <span className="absolute right-full mr-3 text-base text-muted-foreground/40 leading-none">
                  {stopwatch.prevStopwatch !== null ? formatTime(stopwatch.prevStopwatch) : ""}
                </span>
                <span className="text-2xl text-muted-foreground/60 leading-none">
                  {formatTime(stopwatch.stopwatch)}
                </span>
              </div>
            )}
          </>
        )}

        {hasTime && (
          <div className="text-4xl font-mono tabular-nums text-muted-foreground">
            {formatTime(timer.remainingSeconds)}
          </div>
        )}

        {/* Progress bars */}
        <div className="w-full max-w-xs flex flex-col gap-2 mt-4">
          {hasReps && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Reps</div>
              <Progress value={repsProgress} className="h-8" />
            </div>
          )}
          {hasTime && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Time</div>
              <Progress value={timeProgress} className="h-8" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <motion.div
        className="flex flex-col items-center gap-4 pb-10 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        {hasReps && hasAutoCount && (
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={autoCount.running ? autoCount.stop : autoCount.start}
              className={`${ROUND_BTN} ${
                autoCount.running
                  ? "bg-amber-500 shadow-amber-500/30 hover:bg-amber-400 hover:shadow-amber-500/40"
                  : "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-500/40"
              }`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              transition={springTap}
            >
              <span className="inline-block w-8 h-8 leading-8 text-center">
                {autoCount.running ? "■" : "▶"}
              </span>
            </motion.button>
            <div className="text-sm text-muted-foreground tabular-nums h-5">
              {autoCount.running
                ? `+1 in ${autoCount.countdown}s`
                : `Auto-count: every ${autoCountInterval}s`}
            </div>
          </div>
        )}
        {hasReps && !hasAutoCount && (
          <motion.button
            onClick={handleIncrement}
            className={`${ROUND_BTN} bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/40`}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            transition={springTap}
          >
            +1
          </motion.button>
        )}
        {hasTime && (
          <motion.button
            onClick={
              !timerStarted
                ? handleStartTimer
                : timer.isRunning
                  ? () => { timer.pause(); haptic(); }
                  : () => { timer.start(); haptic(); }
            }
            className={`${ROUND_BTN} ${
              timer.isRunning
                ? "bg-amber-500 shadow-amber-500/30 hover:bg-amber-400 hover:shadow-amber-500/40"
                : "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-500/40"
            }`}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            transition={springTap}
          >
            <span className="inline-block w-8 h-8 leading-8 text-center">
              {timer.isRunning ? "■" : "▶"}
            </span>
          </motion.button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleCompleteEarly}
        >
          Finish early
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground/60"
          onClick={handleAbandon}
        >
          Cancel
        </Button>
      </motion.div>
    </div>
  );
}
