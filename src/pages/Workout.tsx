import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useWebSocket, type WSMessage } from "@/hooks/useWebSocket";
import { ChatMessage } from "@/components/ChatMessage";
import { WorkoutCard, type Exercise } from "@/components/WorkoutCard";
import { LogSetForm } from "@/components/LogSetForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Wifi, WifiOff, LogOut, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  normalizeExercises,
  getWorkoutCoach,
  getWorkoutTitle,
} from "@/lib/workout";

type ChatEntry = {
  content: string;
  isUser: boolean;
  coach?: string;
};

type CurrentWorkout = {
  title: string;
  coach: string;
  exercises: Exercise[];
  fatigue?: number;
};

function parseWorkoutFromMessages(messages: WSMessage[]): CurrentWorkout | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.type !== "AGENT_RESPONSE") continue;
    if ((msg as { workout_completed?: boolean }).workout_completed) return null;
    if (!msg.workout) continue;
    const w = msg.workout as Record<string, unknown>;
    const exercises = normalizeExercises(w);
    if (exercises.length === 0) continue;
    return {
      title: getWorkoutTitle(w),
      coach: getWorkoutCoach(w),
      exercises,
      fatigue: msg.state?.fatigue_scores
        ? Math.max(...Object.values(msg.state.fatigue_scores as Record<string, number>), 0)
        : undefined,
    };
  }
  return null;
}

function isWorkoutCompleted(messages: WSMessage[]): boolean {
  const last = [...messages].reverse().find((m) => m.type === "AGENT_RESPONSE");
  return Boolean(last && (last as { workout_completed?: boolean }).workout_completed);
}

const TRUST_MAX_PROMPT = "I want a workout.";

export default function Workout() {
  const { userId, logout } = useUser();
  const { messages: wsMessages, connected, send, sendFinishWorkout, sendLogSet } = useWebSocket(userId);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const lastProcessedRef = useRef(0);
  const trustMaxSentRef = useRef(false);

  const trustMaxFromNav = (location.state as { trustMax?: boolean } | null)?.trustMax === true;
  const [trustMaxMode, setTrustMaxMode] = useState(trustMaxFromNav);

  useEffect(() => {
    if (trustMaxFromNav) setTrustMaxMode(true);
  }, [trustMaxFromNav]);

  useEffect(() => {
    if (!connected || !trustMaxMode || trustMaxSentRef.current) return;
    trustMaxSentRef.current = true;
    send(TRUST_MAX_PROMPT);
    navigate("/workout", { replace: true, state: {} });
  }, [connected, trustMaxMode, send, navigate]);

  useEffect(() => {
    if (trustMaxMode) return;
    for (let i = lastProcessedRef.current; i < wsMessages.length; i++) {
      const msg = wsMessages[i];
      if (msg.type === "AGENT_RESPONSE") {
        const greeting = msg.greeting_message as string | undefined;
        const text = greeting ?? (msg.workout ? "Here's your workout! 💪" : "Got it.");
        setChatHistory((prev) => [
          ...prev,
          { content: text, isUser: false, coach: msg.state?.selected_persona as string | undefined },
        ]);
      } else if (msg.type === "ERROR") {
        setChatHistory((prev) => [
          ...prev,
          { content: (msg.message as string) ?? "Something went wrong.", isUser: false },
        ]);
      }
    }
    lastProcessedRef.current = wsMessages.length;
  }, [trustMaxMode, wsMessages]);

  useEffect(() => {
    if (!trustMaxMode) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory, trustMaxMode]);

  const handleSend = () => {
    if (!input.trim()) return;
    setChatHistory((prev) => [...prev, { content: input, isUser: true }]);
    send(input);
    setInput("");
  };

  const workout = parseWorkoutFromMessages(wsMessages);
  const lastResponse = [...wsMessages].reverse().find((m) => m.type === "AGENT_RESPONSE");
  const isWorkingOut = Boolean(lastResponse && (lastResponse as { is_working_out?: boolean }).is_working_out);
  const workoutCompleted = isWorkoutCompleted(wsMessages);

  useEffect(() => {
    if (trustMaxMode && workoutCompleted) navigate("/dashboard", { replace: true });
  }, [trustMaxMode, workoutCompleted, navigate]);

  const recoveryRedirectRef = useRef(false);
  useEffect(() => {
    if (!trustMaxMode || recoveryRedirectRef.current) return;
    const last = [...wsMessages].reverse().find((m) => m.type === "AGENT_RESPONSE") as WSMessage | undefined;
    if (!last || last.workout != null) return;
    const state = last.state as { workouts_completed_this_week?: number; max_workouts_per_week?: number } | undefined;
    const completed = state?.workouts_completed_this_week ?? 0;
    const max = state?.max_workouts_per_week ?? 4;
    if (completed >= max) {
      recoveryRedirectRef.current = true;
      navigate("/recovery", { replace: true });
    }
  }, [trustMaxMode, wsMessages, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="font-display font-bold text-lg">
            Super<span className="text-primary">Set</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-destructive" />
                <span className="text-destructive">Disconnected</span>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
            History
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {trustMaxMode ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-xl px-4 py-6 flex flex-col gap-6">
              {!workout ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex min-h-[60vh] flex-col items-center justify-center text-center"
                >
                  {!connected ? (
                    <>
                      <span className="text-5xl mb-4">📡</span>
                      <h2 className="font-display text-xl font-semibold mb-2">Connecting...</h2>
                      <p className="text-sm text-muted-foreground">Preparing your workout.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl mb-4">🏋️</span>
                      <h2 className="font-display text-xl font-semibold mb-2">Generating your workout</h2>
                      <p className="text-sm text-muted-foreground">Max is designing it for you.</p>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <WorkoutCard
                    title={workout.title}
                    coach={workout.coach}
                    exercises={workout.exercises}
                    fatigue={workout.fatigue}
                  />
                  {isWorkingOut && (
                    <>
                      <LogSetForm
                        exercises={workout.exercises}
                        onLogSet={sendLogSet}
                        disabled={!connected}
                      />
                      <div className="flex flex-col gap-3 pt-2 border-t">
                        <Button
                          className="w-full rounded-xl h-12 text-base font-semibold"
                          onClick={() => sendFinishWorkout()}
                        >
                          Finish workout
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full rounded-xl"
                          onClick={() => navigate("/dashboard")}
                        >
                          Back to dashboard
                        </Button>
                      </div>
                    </>
                  )}
                  {!isWorkingOut && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => navigate("/dashboard")}
                    >
                      Back to dashboard
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-w-0">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                  >
                    <span className="text-5xl mb-4">🏋️</span>
                    <h2 className="font-display text-xl font-semibold mb-2">Ready to train?</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Tell me what you're in the mood for. Try "Give me a push day" or "I want a quick HIIT session".
                    </p>
                  </motion.div>
                )}
                {chatHistory.map((msg, i) => (
                  <ChatMessage key={i} content={msg.content} isUser={msg.isUser} coach={msg.coach} />
                ))}
              </div>

              <div className="p-4 border-t bg-card/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={connected ? "Ask your coach..." : "Connecting..."}
                    className="rounded-xl h-11"
                    disabled={!connected}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl h-11 w-11 shrink-0"
                    disabled={!connected || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {workout && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block w-80 border-l p-4 overflow-y-auto bg-muted/30 space-y-4"
              >
                <WorkoutCard
                  title={workout.title}
                  coach={workout.coach}
                  exercises={workout.exercises}
                  fatigue={workout.fatigue}
                />
                {isWorkingOut && (
                  <>
                    <LogSetForm
                      exercises={workout.exercises}
                      onLogSet={sendLogSet}
                      disabled={!connected}
                    />
                    <Button
                      className="w-full rounded-xl"
                      onClick={() => sendFinishWorkout()}
                    >
                      Finish workout
                    </Button>
                  </>
                )}
              </motion.aside>
            )}
          </>
        )}
      </div>
    </div>
  );
}
