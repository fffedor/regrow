"use client";

import { motion } from "motion/react";
import { Goal } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SessionCompleteProps {
  goal: Goal;
  reps: number;
  elapsedSeconds: number;
  onGoHome: () => void;
  onRepeat: () => void;
}

export function SessionComplete({
  goal,
  reps,
  elapsedSeconds,
  onGoHome,
  onRepeat,
}: SessionCompleteProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="text-7xl mb-6"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        🎉
      </motion.div>
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.25 }}
      >
        Great job!
      </motion.h2>
      <motion.p
        className="text-lg text-muted-foreground mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.4 }}
      >
        {goal.icon} {goal.name}:{" "}
        {goal.type === "time"
          ? formatTime(elapsedSeconds)
          : `${reps} reps in ${formatTime(elapsedSeconds)}`}
      </motion.p>
      <motion.p
        className="text-xl font-semibold mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
      >
        That was time #{goal.completedCount}! 🔥
      </motion.p>
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.65 }}
      >
        <Button variant="outline" size="lg" onClick={onGoHome}>
          Go Back
        </Button>
        <Button size="lg" onClick={onRepeat}>
          Repeat
        </Button>
      </motion.div>
    </div>
  );
}
