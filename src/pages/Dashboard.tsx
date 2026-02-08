import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { History, User, LogOut, Home, Dumbbell, Battery, Plus, Minus, RotateCcw, Users, Calendar, X } from "lucide-react";
import { toast } from "sonner";

type Status = {
  workouts_completed_this_week: number;
  max_workouts_per_week: number;
  fatigue_scores: Record<string, number>;
  fatigue_threshold: number;
  selected_persona: string;
};

type Profile = {
  subscribed_personas?: string[];
};

const PERSONA_DISPLAY: Record<string, { name: string; specialty: string; color: string }> = {
  iron: { name: "Iron", specialty: "Strength", color: "bg-iron" },
  yoga: { name: "Yoga", specialty: "Mobility", color: "bg-yoga" },
  hiit: { name: "HIIT", specialty: "Cardio", color: "bg-hiit" },
  kickboxing: { name: "Kickboxing", specialty: "Power", color: "bg-kickboxing" },
};

function MaxRobot() {
  return (
    <motion.svg
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      width="160"
      height="160"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-2xl"
    >
      <rect x="40" y="50" width="120" height="100" rx="20" className="fill-card stroke-primary" strokeWidth="3" />
      <motion.g
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 50px" }}
      >
        <line x1="100" y1="50" x2="100" y2="25" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="18" r="8" className="fill-primary" />
      </motion.g>
      <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }}>
        <circle cx="75" cy="90" r="15" className="fill-primary" />
        <circle cx="125" cy="90" r="15" className="fill-primary" />
        <circle cx="78" cy="86" r="5" className="fill-primary-foreground" />
        <circle cx="128" cy="86" r="5" className="fill-primary-foreground" />
      </motion.g>
      <motion.path
        d="M 70 120 Q 100 145 130 120"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <rect x="25" y="75" width="15" height="40" rx="5" className="fill-secondary" />
      <rect x="160" y="75" width="15" height="40" rx="5" className="fill-secondary" />
      <rect x="60" y="150" width="80" height="30" rx="10" className="fill-muted stroke-border" strokeWidth="2" />
      <motion.circle
        cx="100"
        cy="165"
        r="8"
        className="fill-primary"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </motion.svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { userId, logout } = useUser();

  const [status, setStatus] = useState<Status | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatigueDrawerOpen, setFatigueDrawerOpen] = useState(false);
  const [resettingFatigue, setResettingFatigue] = useState(false);
  const [resettingWeek, setResettingWeek] = useState(false);
  const [updatingMax, setUpdatingMax] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      apiFetch<Status>(`/api/users/${userId}/status`),
      apiFetch<Profile>(`/api/users/${userId}/profile`).catch(() => ({ subscribed_personas: [] })),
    ])
      .then(([s, p]) => {
        setStatus(s);
        setProfile(p);
      })
      .catch(() => toast.error("Could not load status"))
      .finally(() => setLoading(false));
  }, [userId]);

  const workoutsThisWeek = status?.workouts_completed_this_week ?? 0;
  const workoutsPerWeekGoal = status?.max_workouts_per_week ?? 4;
  const fatigueScores = status?.fatigue_scores ?? {};
  const maxFatigue = Object.values(fatigueScores).length
    ? Math.max(...Object.values(fatigueScores))
    : 0;
  const fatiguePercent = Math.round(maxFatigue * 100);
  const subscribedPersonas = profile?.subscribed_personas ?? [];
  const creators = subscribedPersonas.map(
    (key) => PERSONA_DISPLAY[key.toLowerCase()] ?? { name: key, specialty: "Coach", color: "bg-primary" }
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleResetFatigue = async () => {
    if (!userId || resettingFatigue) return;
    setResettingFatigue(true);
    try {
      await apiFetch(`/api/users/${userId}/reset-fatigue`, { method: "POST" });
      const s = await apiFetch<Status>(`/api/users/${userId}/status`);
      setStatus(s);
      toast.success("Fatigue reset.");
    } catch {
      toast.error("Could not reset fatigue");
    } finally {
      setResettingFatigue(false);
    }
  };

  const handleNewWeek = async () => {
    if (!userId || resettingWeek) return;
    setResettingWeek(true);
    try {
      await apiFetch(`/api/users/${userId}/new-week`, { method: "POST" });
      const s = await apiFetch<Status>(`/api/users/${userId}/status`);
      setStatus(s);
      toast.success("New week started.");
    } catch {
      toast.error("Could not start new week");
    } finally {
      setResettingWeek(false);
    }
  };

  const handleUpdateMaxWorkouts = async (delta: number) => {
    if (!userId || updatingMax || !status) return;
    const newMax = Math.min(7, Math.max(1, status.max_workouts_per_week + delta));
    if (newMax === status.max_workouts_per_week) return;
    setUpdatingMax(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/${userId}/settings`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ max_workouts_per_week: newMax }),
        }
      );
      if (res.ok) {
        const s = await apiFetch<Status>(`/api/users/${userId}/status`);
        setStatus(s);
      }
    } catch {
      toast.error("Could not update goal");
    } finally {
      setUpdatingMax(false);
    }
  };

  const getFatigueColor = () => {
    if (fatiguePercent < 30) return "text-secondary";
    if (fatiguePercent < 60) return "text-amber-500";
    return "text-destructive";
  };

  const getFatigueLabel = () => {
    if (fatiguePercent < 30) return "Fresh";
    if (fatiguePercent < 60) return "Moderate";
    return "High";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
          <span className="text-2xl">🤖</span>
          <h1 className="font-display font-bold text-lg">
            Super<span className="text-primary">Set</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/history")}>
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[100px]">{userId ?? "User"}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 shrink-0 p-4 border-r bg-muted/20 space-y-4 overflow-y-auto"
        >
          {/* Workouts Card */}
          <Card className="shadow-lg shadow-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Workouts</span>
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-primary">{workoutsThisWeek}</span>
                    <span className="text-sm text-muted-foreground">/ {workoutsPerWeekGoal} this week</span>
                  </div>
                  <Progress value={(workoutsPerWeekGoal ? (workoutsThisWeek / workoutsPerWeekGoal) * 100 : 0)} className="h-2 mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Weekly Goal</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateMaxWorkouts(-1)}
                        disabled={workoutsPerWeekGoal <= 1 || updatingMax}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">{workoutsPerWeekGoal}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateMaxWorkouts(1)}
                        disabled={workoutsPerWeekGoal >= 7 || updatingMax}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fatigue Card */}
          <Card className="shadow-lg shadow-secondary/10 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Battery className={`h-5 w-5 ${getFatigueColor()}`} />
                  <span className="font-semibold">Fatigue</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setFatigueDrawerOpen(true)}
                  disabled={loading}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-3xl font-bold ${getFatigueColor()}`}>{fatiguePercent}%</span>
                    <span className={`text-sm ${getFatigueColor()}`}>{getFatigueLabel()}</span>
                  </div>
                  <Progress value={fatiguePercent} className="h-2" />
                </>
              )}
            </CardContent>
          </Card>

          {/* Creators (from API: subscribed_personas) */}
          <Card className="shadow-lg shadow-muted/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Creators
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : subscribedPersonas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No subscriptions yet</p>
              ) : (
                <div className="space-y-2">
                  {creators.map((creator, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${creator.color} text-primary-foreground text-xs`}>
                          {creator.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{creator.name}</p>
                        <p className="text-xs text-muted-foreground">{creator.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.aside>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Ready to train?</h1>
            <p className="text-muted-foreground text-sm">Choose your path, champion.</p>
          </motion.div>

          <MaxRobot />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md"
          >
            <Button
              size="lg"
              className="flex-1 h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              onClick={() => navigate("/workout", { state: { trustMax: true } })}
            >
              🤖 Trust Max
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 rounded-2xl text-base font-semibold border-2 hover:bg-accent hover:text-accent-foreground transition-all"
              onClick={() => navigate("/workout")}
            >
              🛤️ I'll follow my path
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground mt-8 text-center max-w-xs"
          >
            "Trust Max" lets AI design your workout. "Follow my path" lets you guide the session yourself.
          </motion.p>
        </div>
      </div>

      {/* Fatigue / New week drawer */}
      {fatigueDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setFatigueDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-card border-l shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-display font-semibold text-lg">Fatigue & week</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFatigueDrawerOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-3 flex-1">
              <p className="text-sm text-muted-foreground">
                Reset fatigue scores or simulate starting a new week (resets workout count and applies decay on next run).
              </p>
              <Button
                className="w-full rounded-xl justify-start gap-2"
                variant="outline"
                onClick={handleResetFatigue}
                disabled={resettingFatigue || loading}
              >
                <RotateCcw className="h-4 w-4" />
                {resettingFatigue ? "Resetting..." : "Reset fatigue"}
              </Button>
              <Button
                className="w-full rounded-xl justify-start gap-2 bg-secondary hover:bg-secondary/90"
                onClick={handleNewWeek}
                disabled={resettingWeek || loading}
              >
                <Calendar className="h-4 w-4" />
                {resettingWeek ? "Starting..." : "New week"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
