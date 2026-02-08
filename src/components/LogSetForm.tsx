import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Exercise } from "./WorkoutCard";

type LogSetFormProps = {
  exercises: Exercise[];
  onLogSet: (data: { exercise?: string; exercise_id?: string; weight: number; reps: number; rpe: number }) => void;
  disabled?: boolean;
};

export function LogSetForm({ exercises, onLogSet, disabled }: LogSetFormProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("6");

  const selectedEx = exercises.find((e) => (e.id ? e.id === exerciseId : e.name === exerciseId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    const rpeNum = Math.min(10, Math.max(1, parseInt(rpe, 10) || 6));
    if (!selectedEx) return;
    onLogSet({
      ...(selectedEx.id ? { exercise_id: selectedEx.id } : { exercise: selectedEx.name }),
      weight: w,
      reps: r,
      rpe: rpeNum,
    });
    setWeight("");
    setReps("");
    setRpe("6");
  };

  if (exercises.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Log a set</h3>
      <div className="grid gap-2">
        <Label className="text-xs font-medium text-muted-foreground">Exercise</Label>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          required
          disabled={disabled}
        >
          <option value="">Select exercise</option>
          {exercises.map((ex) => (
            <option key={ex.id ?? ex.name} value={ex.id ?? ex.name}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Weight (kg)</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-10"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Reps</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="h-10"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">RPE (1–10)</Label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="h-2 flex-1 accent-primary"
            disabled={disabled}
          />
          <span className="w-8 text-sm font-semibold tabular-nums">{rpe}</span>
        </div>
      </div>
      <Button type="submit" className="w-full rounded-lg h-10" disabled={disabled || !selectedEx}>
        Log set
      </Button>
    </form>
  );
}
