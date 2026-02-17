"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";

interface GoalListProps {
  goals: Goal[];
  onStart: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export function GoalList({ goals, onStart, onEdit, onDelete }: GoalListProps) {
  const initialRender = useRef(true);
  const isFirst = initialRender.current;
  if (initialRender.current) {
    initialRender.current = false;
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            layout
            initial={
              isFirst
                ? { opacity: 0, y: 20 }
                : { opacity: 0, scale: 0.9 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80 }}
            transition={
              isFirst
                ? {
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: index * 0.06,
                  }
                : { type: "spring", stiffness: 400, damping: 30 }
            }
          >
            <GoalCard
              goal={goal}
              onStart={onStart}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
