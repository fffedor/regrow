"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateGoal: () => void;
}

export function EmptyState({ onCreateGoal }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <motion.div
        className="text-6xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        🌱
      </motion.div>
      <motion.h2
        className="text-xl font-semibold mb-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
      >
        No goals yet
      </motion.h2>
      <motion.p
        className="text-muted-foreground mb-6 max-w-xs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.25 }}
      >
        Create your first goal and start growing through repetition
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.35 }}
      >
        <Button size="lg" onClick={onCreateGoal}>
          + New Goal
        </Button>
      </motion.div>
    </div>
  );
}
