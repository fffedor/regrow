"use client";

import { useState } from "react";
import { Goal, GoalFormData, GoalType } from "@/lib/types";
import { EMOJI_OPTIONS } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GoalFormData) => void;
  editGoal?: Goal | null;
  goalCount?: number;
}

function GoalFormFields({ editGoal, onSave, onClose, goalCount }: {
  editGoal: Goal | null | undefined;
  onSave: (data: GoalFormData) => void;
  onClose: () => void;
  goalCount: number;
}) {
  const [name, setName] = useState(editGoal?.name ?? "");
  const [icon, setIcon] = useState(editGoal?.icon ?? "🎯");
  const [type, setType] = useState<GoalType>(editGoal?.type ?? "reps");
  const [reps, setReps] = useState(editGoal?.targetReps?.toString() ?? "");
  const [minutes, setMinutes] = useState(
    editGoal?.targetSeconds != null ? Math.floor(editGoal.targetSeconds / 60).toString() : "",
  );
  const [seconds, setSeconds] = useState(
    editGoal?.targetSeconds != null ? (editGoal.targetSeconds % 60).toString() : "",
  );
  const [showStopwatch, setShowStopwatch] = useState(editGoal?.showStopwatch !== false);
  const [autoCount, setAutoCount] = useState(
    editGoal?.autoCountInterval != null && editGoal.autoCountInterval > 0,
  );
  const [autoCountInterval, setAutoCountInterval] = useState(
    editGoal?.autoCountInterval ? editGoal.autoCountInterval.toString() : "10",
  );
  const [emojiOpen, setEmojiOpen] = useState(false);

  const needsReps = type === "reps";
  const needsTime = type === "time";

  const repsValid = !needsReps || (reps !== "" && Number(reps) >= 1 && Number(reps) <= 9999);
  const clampedMinutes = Math.max(0, Math.min(99, Number(minutes || 0)));
  const clampedSeconds = Math.max(0, Math.min(59, Number(seconds || 0)));
  const clampedAutoCount = Math.max(1, Math.min(300, Number(autoCountInterval || 1)));
  const timeValid =
    !needsTime ||
    (minutes !== "" || seconds !== "") &&
      (clampedMinutes > 0 || clampedSeconds > 0);
  const isValid = repsValid && timeValid;

  const handleSave = () => {
    if (!isValid) return;
    const totalSeconds =
      needsTime ? clampedMinutes * 60 + clampedSeconds : null;
    const finalName = name.trim() || `My Goal #${goalCount + 1}`;
    onSave({
      name: finalName,
      icon,
      type,
      targetReps: needsReps ? Number(reps) : null,
      targetSeconds: totalSeconds,
      showStopwatch,
      autoCountInterval: needsReps && autoCount ? clampedAutoCount : null,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editGoal ? "Edit Goal" : "New Goal"}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 mt-2">
        {/* Name + Icon */}
        <div>
          <label className="text-sm font-medium mb-1 block">Name</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={`My Goal #${goalCount + 1}`}
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              maxLength={40}
              className="flex-1"
            />
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-2xl p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  {icon}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto">
                <div className="grid grid-cols-7 gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { setIcon(emoji); setEmojiOpen(false); }}
                      className={`text-2xl p-1.5 rounded-lg transition-colors ${
                        icon === emoji
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Goal type */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Completion type
          </label>
          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as GoalType)}
            className="flex gap-4"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="reps" />
              <span>By count</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="time" />
              <span>By time</span>
            </label>
          </RadioGroup>
        </div>

        {/* Reps input */}
        {needsReps && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Repetitions
            </label>
            <Input
              type="number"
              placeholder="30"
              min={1}
              max={9999}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        )}

        {/* Time input */}
        {needsTime && (
          <div>
            <label className="text-sm font-medium mb-1 block">Time</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={99}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-20"
              />
              <span className="text-muted-foreground">min</span>
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-20"
              />
              <span className="text-muted-foreground">sec</span>
            </div>
          </div>
        )}

        {/* Stopwatch toggle */}
        {needsReps && (
          <label className={`flex items-center gap-3 ${autoCount ? "cursor-default opacity-50" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              checked={showStopwatch}
              disabled={autoCount}
              onChange={(e) => setShowStopwatch(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary cursor-pointer disabled:cursor-default"
            />
            <span className="text-sm">Show free timer between reps</span>
          </label>
        )}

        {/* Auto-count toggle */}
        {needsReps && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCount}
                onChange={(e) => {
                  setAutoCount(e.target.checked);
                  if (e.target.checked) setShowStopwatch(false);
                }}
                className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
              />
              <span className="text-sm">Auto-count</span>
            </label>
            {autoCount && (
              <div className="flex items-center gap-2 ml-7">
                <span className="text-sm text-muted-foreground">every</span>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={autoCountInterval}
                  onChange={(e) => setAutoCountInterval(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">sec</span>
              </div>
            )}
          </div>
        )}

        <Button onClick={handleSave} disabled={!isValid} className="mt-2">
          Save
        </Button>
      </div>
    </>
  );
}

export function GoalForm({ open, onClose, onSave, editGoal, goalCount = 0 }: GoalFormProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <GoalFormFields
          key={editGoal?.id ?? "new"}
          editGoal={editGoal}
          onSave={onSave}
          onClose={onClose}
          goalCount={goalCount}
        />
      </DialogContent>
    </Dialog>
  );
}
