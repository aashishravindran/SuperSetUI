import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send } from "lucide-react";

type Message = {
  content: string;
  isUser: boolean;
  options?: string[];
  inputOnly?: boolean;
};

type IntakeStep = {
  question: string;
  options: string[];
  key: string;
  inputOnly?: boolean;
};

const intakeFlow: IntakeStep[] = [
  {
    question: "Hey there! 👋 I'm Max, your AI fitness buddy. Let's get you set up! First off — what's your main fitness goal?",
    options: ["Build Muscle 💪", "Lose Fat 🔥", "Improve Endurance 🏃", "Stay Active 🧘"],
    key: "goal",
  },
  {
    question: "Awesome choice! Now, how would you rate your current experience level?",
    options: ["Beginner 🌱", "Intermediate 📈", "Advanced 🏆"],
    key: "experience",
  },
  {
    question: "Got it! How many days per week can you realistically commit to training?",
    options: ["2 days", "3 days", "4 days", "5+ days"],
    key: "frequency",
  },
  {
    question: "Any areas where you're feeling sore or have limitations I should know about?",
    options: ["None — I'm good! ✅", "Lower Back", "Knees", "Shoulders", "Other"],
    key: "limitations",
  },
  {
    question: "Cool! What's your height? (e.g., 5'10\" or 178 cm)",
    options: [],
    key: "height",
    inputOnly: true,
  },
  {
    question: "And your current weight? (e.g., 170 lbs or 77 kg)",
    options: [],
    key: "weight",
    inputOnly: true,
  },
  {
    question: "Last one! Tell me a bit about yourself — your lifestyle, motivation, or anything else you'd like me to know. 📝",
    options: [],
    key: "about",
    inputOnly: true,
  },
];

function parseHeightToCm(value: string): number {
  const s = value.trim().toLowerCase();
  const cmMatch = s.match(/(\d+(?:\.\d+)?)\s*cm/);
  if (cmMatch) return parseFloat(cmMatch[1]);
  const ftInMatch = s.match(/(\d+)\s*['']?\s*(?:(\d+)\s*(?:"|in)?)?/);
  if (ftInMatch) {
    const ft = parseFloat(ftInMatch[1]);
    const inch = ftInMatch[2] ? parseFloat(ftInMatch[2]) : 0;
    return (ft * 12 + inch) * 2.54;
  }
  const num = parseFloat(s.replace(/[^\d.]/g, ""));
  return num > 10 ? num : num * 2.54;
}

function parseWeightToKg(value: string): number {
  const s = value.trim().toLowerCase();
  const kgMatch = s.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) return parseFloat(kgMatch[1]);
  const lbMatch = s.match(/(\d+(?:\.\d+)?)\s*lbs?/);
  if (lbMatch) return parseFloat(lbMatch[1]) * 0.453592;
  const num = parseFloat(s.replace(/[^\d.]/g, ""));
  return num < 200 ? num : num * 0.453592;
}

export default function Onboarding() {
  const [messages, setMessages] = useState<Message[]>([
    { content: intakeFlow[0].question, isUser: false, options: intakeFlow[0].options },
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userId, setOnboarded, isOnboarded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnboarded) navigate("/dashboard", { replace: true });
  }, [isOnboarded, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSelect = async (value: string) => {
    const currentStep = intakeFlow[stepIndex];
    const updated = { ...answers, [currentStep.key]: value };
    setAnswers(updated);
    setMessages((prev) => [...prev, { content: value, isUser: true }]);

    if (stepIndex < intakeFlow.length - 1) {
      setTimeout(() => {
        const next = intakeFlow[stepIndex + 1];
        setMessages((prev) => [...prev, { content: next.question, isUser: false, options: next.options }]);
        setStepIndex(stepIndex + 1);
      }, 600);
    } else {
      setLoading(true);
      setMessages((prev) => [...prev, { content: "Perfect! Setting up your profile... 🚀", isUser: false }]);

      try {
        const height_cm = parseHeightToCm(updated.height ?? "170");
        const weight_kg = parseWeightToKg(updated.weight ?? "70");
        const fitness_level = (updated.experience ?? "Intermediate").replace(/\s*[🌱📈🏆].*$/, "").trim() || "Intermediate";
        const about_me = [updated.goal, updated.limitations, updated.about].filter(Boolean).join(". ");

        let intakeRes: { recommended_personas?: string[]; subscribed_personas?: string[] };
        try {
          intakeRes = await apiFetch<{
            recommended_personas?: string[];
            subscribed_personas?: string[];
          }>(`/api/users/${userId}/intake`, {
            method: "POST",
            body: JSON.stringify({
              height_cm: Number(height_cm) || 170,
              weight_kg: Number(weight_kg) || 70,
              fitness_level,
              about_me: about_me || "",
            }),
          });
        } catch (e) {
          if (e instanceof ApiError) {
            if (e.status === 0) {
              toast.error("Cannot reach the server. Is the backend running at " + (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "?");
            } else if (e.status === 501) {
              toast.error("Persona recommender is disabled on the server.");
            } else if (e.status === 409) {
              toast.info("Already set up. Taking you to the dashboard.");
            } else {
              toast.error(e.message || "Setup failed. We'll continue to the dashboard.");
            }
          } else {
            toast.error("Could not sync with server, but we'll continue!");
          }
          intakeRes = { subscribed_personas: ["iron"], recommended_personas: ["iron"] };
        }

        const personasToSubscribe =
          intakeRes.subscribed_personas?.length
            ? intakeRes.subscribed_personas
            : intakeRes.recommended_personas?.length
              ? intakeRes.recommended_personas
              : ["iron"];
        try {
          await apiFetch(`/api/users/${userId}/select-persona`, {
            method: "POST",
            body: JSON.stringify({ personas: personasToSubscribe }),
          });
        } catch (e) {
          if (e instanceof ApiError && e.status === 0) {
            toast.error("Cannot reach the server. Creators may not be saved.");
          } else if (e instanceof ApiError && e.status === 404) {
            toast.warning("Profile not ready yet. Creators will sync when you use the app.");
          } else {
            toast.warning("Could not save creators. You can still use the app.");
          }
        }
      } catch {
        toast.error("Something went wrong. We'll continue to the dashboard.");
      }

      setTimeout(() => {
        setOnboarded(true);
        navigate("/dashboard");
      }, 1200);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleSelect(customInput.trim());
    setCustomInput("");
  };

  const currentStep = intakeFlow[stepIndex];
  const currentOptions = messages[messages.length - 1]?.options;
  const isInputOnlyStep = currentStep?.inputOnly;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-2xl">
          🤖
        </motion.div>
        <div>
          <h1 className="font-display font-bold text-base">Max</h1>
          <p className="text-xs text-muted-foreground">Your AI Fitness Buddy</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                {!msg.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-display font-semibold text-xs text-primary">Max</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentOptions && currentOptions.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-2">
            {currentOptions.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </Button>
            ))}
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t bg-card/30">
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={isInputOnlyStep ? "Type your answer..." : "Or type your answer..."}
            className="rounded-xl h-11"
            disabled={loading}
            autoFocus={isInputOnlyStep}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl h-11 w-11 shrink-0"
            disabled={loading || !customInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
