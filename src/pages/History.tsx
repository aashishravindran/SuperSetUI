import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoachBadge } from "@/components/CoachBadge";
import { useNavigate } from "react-router-dom";
import { Home, Dumbbell, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeExercises, getWorkoutCoach } from "@/lib/workout";

type WorkoutEntry = {
  id: string;
  date: string;
  coach: string;
  exercises: { name: string; sets: number; reps: string }[];
  rpe?: number;
};

export default function History() {
  const { userId } = useUser();
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    apiFetch<{ workout_history: Record<string, unknown>[] }>(`/api/users/${userId}/history`)
      .then((res) => {
        const raw = res.workout_history ?? [];
        const list: WorkoutEntry[] = raw.map((w, i) => {
          const exercises = normalizeExercises(w);
          return {
            id: `workout-${i}`,
            date: new Date().toISOString().slice(0, 10),
            coach: getWorkoutCoach(w),
            exercises: exercises.map((e) => ({ name: e.name, sets: e.sets, reps: e.reps })),
            rpe: undefined,
          };
        });
        setHistory(list.reverse());
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const thisWeekCount = history.filter((_, i) => i < 7).length;
  const avgRpe =
    history.length > 0
      ? (
          history.reduce((sum, h) => sum + (h.rpe ?? 0), 0) /
          history.filter((h) => h.rpe != null).length || 0
        ).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Home">
          <Home className="h-4 w-4" />
        </Button>
        <h1 className="font-display font-bold text-lg">
          Your <span className="text-primary">History</span>
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-3 p-4 max-w-2xl mx-auto">
        {[
          { icon: Dumbbell, label: "Workouts", value: history.length },
          { icon: Clock, label: "This Week", value: thisWeekCount },
          { icon: TrendingUp, label: "Avg RPE", value: avgRpe },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8 space-y-3">
        {loading && (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        )}
        {!loading && history.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-muted-foreground">No workouts yet. Start your first session!</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate("/workout")}>
              Start Training
            </Button>
          </div>
        )}
        {history.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-display">
                    Session {history.length - i}
                  </CardTitle>
                  <CoachBadge coach={entry.coach} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {entry.exercises.map((ex, j) => (
                    <span key={j} className="text-xs bg-muted rounded-full px-2.5 py-1">
                      {ex.name}
                    </span>
                  ))}
                </div>
                {entry.rpe != null && (
                  <p className="text-xs text-muted-foreground mt-2">RPE: {entry.rpe}/10</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
