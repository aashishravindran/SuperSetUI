import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachBadge } from "./CoachBadge";

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rpe?: number;
  notes?: string;
  id?: string;
};

type WorkoutCardProps = {
  title: string;
  coach?: string;
  exercises: Exercise[];
  fatigue?: number;
};

export function WorkoutCard({ title, coach, exercises, fatigue }: WorkoutCardProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">{title}</CardTitle>
          {coach && <CoachBadge coach={coach} />}
        </div>
        {fatigue !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Fatigue</span>
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-energy transition-all"
                style={{ width: `${Math.min(fatigue * 10, 100)}%` }}
              />
            </div>
            <span>{Number(fatigue).toFixed(1)}/10</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {exercises.map((ex, i) => (
          <div key={ex.id ?? i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="font-medium text-sm">{ex.name}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{ex.sets} × {ex.reps}</span>
              {ex.rpe != null && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                  RPE {ex.rpe}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
