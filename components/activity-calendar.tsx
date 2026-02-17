"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Goal, Session } from "@/lib/types";
import { getSessions, getCalendarVisible, setCalendarVisible } from "@/lib/storage";
import {
  computeMonthStatuses,
  getFirstDayOfWeek,
  getMonthName,
  CalendarDay,
} from "@/lib/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function getDayClass(day: CalendarDay): string {
  let color: string;
  switch (day.status) {
    case "full":
      color = "bg-emerald-500 text-white";
      break;
    case "partial":
      color = "bg-amber-400 text-white";
      break;
    default:
      color = "bg-muted text-muted-foreground";
  }

  return cn(
    "w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-medium",
    color,
    day.isFuture && "opacity-30",
  );
}

function DayCell({ day }: { day: CalendarDay }) {
  const hasActivity = day.completedGoals.length > 0;

  if (!hasActivity || day.isFuture) {
    return (
      <div className={getDayClass(day)}>
        {day.dayOfMonth}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(getDayClass(day), "cursor-default")}>
          {day.dayOfMonth}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-48">
        <p className="font-medium mb-1">
          {day.completedGoals.length}/{day.totalGoals}
        </p>
        <ul className="space-y-0.5">
          {day.completedGoals.map((g, i) => (
            <li key={i} className="flex items-center gap-1">
              <span>{g.icon}</span>
              <span>{g.name}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function MonthGrid({
  year,
  month,
  goals,
  sessions,
}: {
  year: number;
  month: number;
  goals: Goal[];
  sessions: Session[];
}) {
  const days = useMemo(
    () => computeMonthStatuses(year, month, goals, sessions),
    [year, month, goals, sessions],
  );
  const offset = getFirstDayOfWeek(year, month);

  return (
    <div>
      <p className="text-xs text-muted-foreground text-center mb-1.5">
        {getMonthName(month)} {year}
      </p>
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} className="w-8 h-8" />
        ))}
        {days.map((day) => (
          <DayCell key={day.dayOfMonth} day={day} />
        ))}
      </div>
    </div>
  );
}

export function ActivityCalendar({ goals }: { goals: Goal[] }) {
  const [visible, setVisible] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);

  useEffect(() => {
    setVisible(getCalendarVisible());
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sessions = useMemo(() => getSessions(), [goals, visible, pageOffset]);

  function toggle() {
    setVisible((v) => {
      const next = !v;
      setCalendarVisible(next);
      return next;
    });
  }

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  const d1 = new Date(curYear, curMonth + pageOffset * 2 - 1, 1);
  const d2 = new Date(curYear, curMonth + pageOffset * 2, 1);

  const isCurrentPage = pageOffset === 0;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-center gap-4 mb-3">
        <AnimatePresence>
          {visible && (
            <motion.button
              key="chevron-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setPageOffset((o) => o - 1)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={toggle}
          className={cn(
            "p-1 transition-colors cursor-pointer",
            visible
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CalendarDays className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {visible && (
            <motion.button
              key="chevron-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setPageOffset((o) => o + 1)}
              disabled={isCurrentPage}
              className={cn(
                "p-1 transition-colors",
                isCurrentPage
                  ? "text-muted-foreground/30 cursor-default"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key="calendar-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex justify-center gap-6">
              <MonthGrid
                year={d1.getFullYear()}
                month={d1.getMonth()}
                goals={goals}
                sessions={sessions}
              />
              <MonthGrid
                year={d2.getFullYear()}
                month={d2.getMonth()}
                goals={goals}
                sessions={sessions}
              />
            </div>
            <div className="flex justify-center gap-4 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" /> All done</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400" /> Partial</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted" /> None</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
