import type { Exercise } from "@/components/WorkoutCard";

/** Backend workout can have exercises, poses, or activities */
export function normalizeExercises(workout: Record<string, unknown>): Exercise[] {
  const raw =
    (workout.exercises as Record<string, unknown>[] | undefined) ??
    (workout.poses as Record<string, unknown>[] | undefined) ??
    (workout.activities as Record<string, unknown>[] | undefined) ??
    [];
  return raw.map((ex) => ({
    id: (ex.id as string) ?? undefined,
    name:
      (ex.exercise_name as string) ??
      (ex.pose_name as string) ??
      (ex.name as string) ??
      "Exercise",
    sets: (ex.sets as number) ?? 0,
    reps: String((ex.reps as string) ?? (ex.duration as string) ?? "—"),
    rpe: ex.rpe as number | undefined,
    notes: ex.notes as string | undefined,
  }));
}

export function getWorkoutCoach(workout: Record<string, unknown>): string {
  const area = (workout.focus_area as string) ?? (workout.focus_system as string) ?? "";
  const lower = area.toLowerCase();
  if (lower.includes("push") || lower.includes("pull") || lower.includes("leg")) return "iron";
  if (lower.includes("spine") || lower.includes("hip") || lower.includes("shoulder")) return "yoga";
  if (lower.includes("cardio") || lower.includes("cns")) return "hiit";
  if (lower.includes("coordination") || lower.includes("speed")) return "kickboxing";
  return "iron";
}

export function getWorkoutTitle(workout: Record<string, unknown>): string {
  return (workout.title as string) ?? (workout.focus_area as string) ?? "Today's Workout";
}
