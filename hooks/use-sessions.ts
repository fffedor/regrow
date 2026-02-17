"use client";

import { useCallback } from "react";
import { Session } from "@/lib/types";
import * as storage from "@/lib/storage";
import { generateId } from "@/lib/utils";

export function useSessions() {
  const startSession = useCallback(
    (forGoalId: string): Session => {
      const session: Session = {
        id: generateId(),
        goalId: forGoalId,
        startedAt: new Date().toISOString(),
        completedAt: null,
        currentReps: 0,
        elapsedSeconds: 0,
        status: "active",
      };
      storage.addSession(session);
      return session;
    },
    [],
  );

  const completeSession = useCallback(
    (sessionId: string, reps: number, elapsed: number) => {
      storage.updateSession(sessionId, {
        status: "completed",
        completedAt: new Date().toISOString(),
        currentReps: reps,
        elapsedSeconds: elapsed,
      });
    },
    [],
  );

  const abandonSession = useCallback(
    (sessionId: string, reps: number, elapsed: number) => {
      storage.updateSession(sessionId, {
        status: "abandoned",
        completedAt: new Date().toISOString(),
        currentReps: reps,
        elapsedSeconds: elapsed,
      });
    },
    [],
  );

  return { startSession, completeSession, abandonSession };
}
