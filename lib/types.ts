export type GoalType = "reps" | "time";

export interface Goal {
  id: string;
  name: string;
  icon: string;
  type: GoalType;
  targetReps: number | null;
  targetSeconds: number | null;
  completedCount: number;
  lastCompletedAt: string | null;
  createdAt: string;
  showStopwatch?: boolean;
  autoCountInterval?: number | null;
}

export interface GoalFormData {
  name: string;
  icon: string;
  type: GoalType;
  targetReps: number | null;
  targetSeconds: number | null;
  showStopwatch: boolean;
  autoCountInterval: number | null;
}

export interface Session {
  id: string;
  goalId: string;
  startedAt: string;
  completedAt: string | null;
  currentReps: number;
  elapsedSeconds: number;
  status: "active" | "completed" | "abandoned";
}
