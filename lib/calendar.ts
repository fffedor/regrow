import { Goal, Session } from "./types";

export type DayStatus = "none" | "partial" | "full";

export interface CompletedGoalInfo {
  name: string;
  icon: string;
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  status: DayStatus;
  isFuture: boolean;
  isToday: boolean;
  completedGoals: CompletedGoalInfo[];
  totalGoals: number;
}

export function toDateString(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

export function computeMonthStatuses(
  year: number,
  month: number,
  goals: Goal[],
  sessions: Session[],
): CalendarDay[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const completedByDay = new Map<string, Set<string>>();
  for (const s of sessions) {
    if (s.status === "completed" && s.completedAt) {
      const dateStr = toDateString(s.completedAt);
      if (!completedByDay.has(dateStr)) {
        completedByDay.set(dateStr, new Set());
      }
      completedByDay.get(dateStr)!.add(s.goalId);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const days: CalendarDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    const existingGoals = goals.filter((g) => toDateString(g.createdAt) <= dateStr);

    const completedGoalIds = completedByDay.get(dateStr) ?? new Set();

    let status: DayStatus = "none";
    if (existingGoals.length > 0 && !isFuture) {
      const completedCount = existingGoals.filter((g) =>
        completedGoalIds.has(g.id),
      ).length;

      if (completedCount === existingGoals.length) {
        status = "full";
      } else if (completedCount > 0) {
        status = "partial";
      }
    }

    const completedGoals: CompletedGoalInfo[] = existingGoals
      .filter((g) => completedGoalIds.has(g.id))
      .map((g) => ({ name: g.name, icon: g.icon }));

    days.push({
      date,
      dayOfMonth: d,
      status,
      isFuture,
      isToday,
      completedGoals,
      totalGoals: existingGoals.length,
    });
  }

  return days;
}
