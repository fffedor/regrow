"use client";

import { memo } from "react";
import { Goal } from "@/lib/types";
import { formatGoalTarget, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCardProps {
  goal: Goal;
  onStart: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export const GoalCard = memo(function GoalCard({ goal, onStart, onEdit, onDelete }: GoalCardProps) {
  return (
    <Card className="relative">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="text-3xl shrink-0">{goal.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold truncate">{goal.name}</span>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {formatGoalTarget(goal.type, goal.targetReps, goal.targetSeconds)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {goal.completedCount > 0 ? (
              <span>
                🔥 {goal.completedCount} times
                {goal.lastCompletedAt && (
                  <span className="opacity-60"> · {formatRelativeTime(goal.lastCompletedAt)}</span>
                )}
              </span>
            ) : (
              <span className="opacity-50">not yet</span>
            )}
          </div>
        </div>
        <div className="flex items-stretch gap-1 shrink-0 self-stretch">
          <Button size="default" className="h-auto" onClick={() => onStart(goal)}>
            Start
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 text-lg leading-none font-bold h-auto self-stretch">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(goal)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});
