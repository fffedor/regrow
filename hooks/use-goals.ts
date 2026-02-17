"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Goal } from "@/lib/types";
import * as storage from "@/lib/storage";
import { generateId } from "@/lib/utils";

let goalsVersion = 0;
let goalsCache: Goal[] | null = null;
let cacheVersion = -1;
const listeners = new Set<() => void>();

function notifyGoals() {
  goalsVersion++;
  listeners.forEach((l) => l());
}

function subscribeGoals(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function getGoalsSnapshot(): Goal[] {
  if (cacheVersion !== goalsVersion) {
    goalsCache = storage.getGoals();
    cacheVersion = goalsVersion;
  }
  return goalsCache!;
}

const SERVER_GOALS: Goal[] = [];
function getServerSnapshot(): Goal[] {
  return SERVER_GOALS;
}

export function useGoals() {
  const goals = useSyncExternalStore(subscribeGoals, getGoalsSnapshot, getServerSnapshot);

  const addGoal = useCallback(
    (data: Omit<Goal, "id" | "completedCount" | "lastCompletedAt" | "createdAt">) => {
      const goal: Goal = {
        ...data,
        id: generateId(),
        completedCount: 0,
        lastCompletedAt: null,
        createdAt: new Date().toISOString(),
      };
      storage.addGoal(goal);
      notifyGoals();
      return goal;
    },
    [],
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => {
      storage.updateGoal(id, updates);
      notifyGoals();
    },
    [],
  );

  const deleteGoal = useCallback((id: string) => {
    storage.deleteGoal(id);
    notifyGoals();
  }, []);

  const incrementCompleted = useCallback((goalId: string) => {
    storage.incrementCompletedCount(goalId);
    notifyGoals();
  }, []);

  const reload = useCallback(() => {
    notifyGoals();
  }, []);

  return { goals, loading: false, addGoal, updateGoal, deleteGoal, incrementCompleted, reload };
}
