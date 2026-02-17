import { Goal, Session } from "./types";

const GOALS_KEY = "regrow_goals";
const SESSIONS_KEY = "regrow_sessions";
const CALENDAR_VISIBLE_KEY = "regrow_calendar_visible";

const MAX_SESSIONS = 5000;
const PRUNE_TARGET = 4000;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getGoals(): Goal[] {
  return read<Goal>(GOALS_KEY);
}

export function saveGoals(goals: Goal[]): boolean {
  return write(GOALS_KEY, goals);
}

export function getGoal(id: string): Goal | undefined {
  return getGoals().find((g) => g.id === id);
}

export function addGoal(goal: Goal): boolean {
  const goals = getGoals();
  goals.push(goal);
  return saveGoals(goals);
}

export function updateGoal(id: string, updates: Partial<Goal>): boolean {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx !== -1) {
    goals[idx] = { ...goals[idx], ...updates };
    return saveGoals(goals);
  }
  return false;
}

export function deleteGoal(id: string): void {
  saveGoals(getGoals().filter((g) => g.id !== id));
  saveSessions(getSessions().filter((s) => s.goalId !== id));
}

export function incrementCompletedCount(goalId: string): void {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === goalId);
  if (idx !== -1) {
    goals[idx].completedCount += 1;
    goals[idx].lastCompletedAt = new Date().toISOString();
    saveGoals(goals);
  }
}

export function getCalendarVisible(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(CALENDAR_VISIBLE_KEY);
  return val === null ? false : val === "true";
}

export function setCalendarVisible(visible: boolean): void {
  localStorage.setItem(CALENDAR_VISIBLE_KEY, String(visible));
}

export function getSessions(): Session[] {
  return read<Session>(SESSIONS_KEY);
}

export function saveSessions(sessions: Session[]): boolean {
  return write(SESSIONS_KEY, sessions);
}

export function getSessionsByGoal(goalId: string): Session[] {
  return getSessions().filter((s) => s.goalId === goalId);
}

export function addSession(session: Session): boolean {
  const sessions = getSessions();
  sessions.push(session);
  return saveSessions(sessions);
}

export function updateSession(id: string, updates: Partial<Session>): boolean {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], ...updates };
    return saveSessions(sessions);
  }
  return false;
}

export function abandonOrphanedSessions(): void {
  const sessions = getSessions();
  let changed = false;
  for (const s of sessions) {
    if (s.status === "active") {
      s.status = "abandoned";
      s.completedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) saveSessions(sessions);
}

export function pruneSessions(): void {
  const sessions = getSessions();
  if (sessions.length <= MAX_SESSIONS) return;
  sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  saveSessions(sessions.slice(0, PRUNE_TARGET));
}
