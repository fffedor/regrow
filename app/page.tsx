"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Goal, GoalFormData } from "@/lib/types";
import { useGoals } from "@/hooks/use-goals";
import { abandonOrphanedSessions, pruneSessions } from "@/lib/storage";
import { GoalList } from "@/components/goal-list";
import { GoalForm } from "@/components/goal-form";
import { SessionView } from "@/components/session-view";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActivityCalendar } from "@/components/activity-calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const viewTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
};

export default function Home() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, incrementCompleted, reload } = useGoals();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  useEffect(() => {
    abandonOrphanedSessions();
    pruneSessions();
  }, []);

  const handleSave = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingGoal) {
      deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  const handleStartSession = (goal: Goal) => {
    setActiveGoal(goal);
  };

  const handleSessionClose = () => {
    setActiveGoal(null);
    reload();
  };

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      {activeGoal ? (
        <motion.div key="session" {...viewTransition}>
          <SessionView
            goal={activeGoal}
            onClose={handleSessionClose}
            onCompleted={incrementCompleted}
          />
        </motion.div>
      ) : (
        <motion.div key="home" {...viewTransition}>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-4 pt-8 pb-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                <div />
                <h1 className="text-3xl font-bold">ReGrow</h1>
                <div className="flex justify-end">
                  <ThemeToggle />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-1 text-center">
                Grow through repetition
              </p>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full">
              <ActivityCalendar goals={goals} />
              {goals.length === 0 ? (
                <EmptyState onCreateGoal={() => setFormOpen(true)} />
              ) : (
                <>
                  <GoalList
                    goals={goals}
                    onStart={handleStartSession}
                    onEdit={handleEdit}
                    onDelete={(g) => setDeletingGoal(g)}
                  />
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingGoal(null);
                        setFormOpen(true);
                      }}
                    >
                      + New Goal
                    </Button>
                  </div>
                </>
              )}
            </main>

            <footer className="pb-4 pt-0 text-center text-xs text-gray-400 dark:text-gray-600">
              <a href="https://github.com/fffedor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                @fffedor
              </a>
            </footer>

            {/* Goal form dialog */}
            <GoalForm
              open={formOpen}
              onClose={() => {
                setFormOpen(false);
                setEditingGoal(null);
              }}
              onSave={handleSave}
              editGoal={editingGoal}
              goalCount={goals.length}
            />

            {/* Delete confirmation */}
            <AlertDialog
              open={!!deletingGoal}
              onOpenChange={(o) => !o && setDeletingGoal(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete goal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Goal &ldquo;{deletingGoal?.name}&rdquo; and all related sessions
                    will be deleted. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
